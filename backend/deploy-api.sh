#!/usr/bin/env bash
set -Eeuo pipefail

######################################
# Configuration
######################################
REMOTE_USER_HOST="debian@ks-b"

# Base dir for the app on the server
API_ROOT="/var/www/chat"

# Paths on the server
NEST_DIR="$API_ROOT/backend"
NEST_BACKUP_DIR="$API_ROOT/backend.bak"
NEST_RELEASES_DIR="$API_ROOT/backend-releases"

# Persistent SQLite dir (lives OUTSIDE the swapped backend dir so deploys never
# touch the database). Must match DATABASE_PATH's dir in ecosystem.config.js.
DATA_DIR="$API_ROOT/data"

# Local project dir — this script lives inside backend/, so SCRIPT_DIR IS the
# backend source dir we deploy (and where ecosystem.config.js sits next to it).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

######################################
# Utility functions
######################################

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Remote rollback helper (used by manual and auto rollback)
remote_rollback() {
  ssh "$REMOTE_USER_HOST" \
    NEST_DIR="$NEST_DIR" \
    NEST_BACKUP_DIR="$NEST_BACKUP_DIR" \
    API_ROOT="$API_ROOT" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

cd "$API_ROOT"

if [ ! -d "$NEST_BACKUP_DIR" ]; then
  echo "❌ ERROR: Backup directory not found" >&2
  exit 1
fi

rm -rf "$NEST_DIR"
mv "$NEST_BACKUP_DIR" "$NEST_DIR"

echo "✅ Backend rollback done on server (restored from backup)"
EOF
}

restart_pm2() {
  ssh "$REMOTE_USER_HOST" \
    API_ROOT="$API_ROOT" \
    'bash -s' << 'EOF'
set -Eeuo pipefail
export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"
cd "$API_ROOT"
pm2 reload ecosystem.config.js --env production 2>/dev/null || pm2 start ecosystem.config.js --env production
pm2 save
EOF
}

deploy() {
  cd "$SCRIPT_DIR"

  ######################################
  # Git metadata for release naming
  ######################################

  local GIT_HASH
  GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")

  local GIT_BRANCH_RAW
  GIT_BRANCH_RAW=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "no-branch")

  local GIT_BRANCH
  GIT_BRANCH=${GIT_BRANCH_RAW//\//-}
  GIT_BRANCH=${GIT_BRANCH// /_}

  local TIMESTAMP
  TIMESTAMP=$(date +'%Y%m%d-%H%M%S')

  local RELEASE_NAME="release-${TIMESTAMP}-${GIT_BRANCH}-${GIT_HASH}"
  local NEST_RELEASE_REMOTE="$NEST_RELEASES_DIR/$RELEASE_NAME"
  local SWITCH_DONE="false"

  ######################################
  # Error handler (rollback if needed)
  ######################################
  on_error() {
    local lineno=$1
    log "❌ ERROR: Backend deployment failed at line $lineno"

    if [[ "$SWITCH_DONE" == "true" ]]; then
      log "↩️  Auto rollback: switching backend back to previous version"
      if remote_rollback; then
        log "✅ Auto rollback succeeded"
        log "➡️  Reloading backend with pm2 after rollback"
        restart_pm2
      else
        log "❌ Auto rollback failed, manual intervention required"
      fi
    else
      log "ℹ️  No rollback needed: backend production was not modified yet"
    fi
  }

  trap 'on_error $LINENO' ERR

  ######################################
  # Remote: prepare release + persistent data dir
  ######################################
  log "➡️  Preparing release directory on server"

  ssh "$REMOTE_USER_HOST" \
    NEST_RELEASES_DIR="$NEST_RELEASES_DIR" \
    NEST_RELEASE_REMOTE="$NEST_RELEASE_REMOTE" \
    API_ROOT="$API_ROOT" \
    DATA_DIR="$DATA_DIR" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

mkdir -p "$API_ROOT"
mkdir -p "$NEST_RELEASES_DIR"
mkdir -p "$DATA_DIR"

rm -rf "$NEST_RELEASE_REMOTE"
mkdir -p "$NEST_RELEASE_REMOTE"
EOF

  ######################################
  # Rsync backend source to release dir
  #
  # Source is this script's own dir (backend/). Excludes: build output, deps,
  # all LOCAL runtime artifacts (the dev SQLite db, redis dump, .env), and the
  # two deploy-time files (this script + ecosystem.config.js, which is scp'd
  # separately to API_ROOT, above the swap). The mock corpus under assets/ IS
  # shipped.
  ######################################
  log "➡️  Syncing backend source to release directory (rsync)"

  rsync -az \
    --delete \
    --exclude=".git" \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude=".DS_Store" \
    --exclude=".env" \
    --exclude="data" \
    --exclude="*.db" \
    --exclude="*.db-shm" \
    --exclude="*.db-wal" \
    --exclude="dump.rdb" \
    --exclude="*.tsbuildinfo" \
    --exclude="deploy-api.sh" \
    --exclude="ecosystem.config.js" \
    "$SCRIPT_DIR/" \
    "$REMOTE_USER_HOST":"$NEST_RELEASE_REMOTE/"

  ######################################
  # Rsync ecosystem.config.js (prod env lives here, deployed above the swap)
  ######################################
  log "➡️  Syncing ecosystem.config.js"

  scp "$SCRIPT_DIR/ecosystem.config.js" "$REMOTE_USER_HOST:$API_ROOT/ecosystem.config.js"

  ######################################
  # Switch current ↔ backup (atomic)
  ######################################
  log "➡️  Performing atomic backend release switch with backup"

  ssh "$REMOTE_USER_HOST" \
    NEST_DIR="$NEST_DIR" \
    NEST_BACKUP_DIR="$NEST_BACKUP_DIR" \
    NEST_RELEASE_REMOTE="$NEST_RELEASE_REMOTE" \
    API_ROOT="$API_ROOT" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

cd "$API_ROOT"

if [ ! -d "$NEST_RELEASE_REMOTE" ]; then
  echo "❌ ERROR: Release directory does not exist" >&2
  exit 1
fi

if [ ! -f "$NEST_RELEASE_REMOTE/package.json" ]; then
  echo "❌ ERROR: Backend release is empty (no package.json in $NEST_RELEASE_REMOTE)" >&2
  exit 1
fi

rm -rf "$NEST_BACKUP_DIR"

if [ -d "$NEST_DIR" ]; then
  mv "$NEST_DIR" "$NEST_BACKUP_DIR"
fi

mv "$NEST_RELEASE_REMOTE" "$NEST_DIR"

echo "✅ New backend release activated"
EOF

  SWITCH_DONE="true"

  ######################################
  # Fresh install + build + restart via pm2
  ######################################
  log "➡️  Installing dependencies and building on server"

  ssh "$REMOTE_USER_HOST" \
    NEST_DIR="$NEST_DIR" \
    API_ROOT="$API_ROOT" \
    'bash -s' << 'EOF'
set -Eeuo pipefail

export PATH="/home/debian/.npm-global/bin:/home/debian/.local/share/pnpm:/usr/local/bin:/usr/bin:/bin:/usr/sbin:$PATH"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ pnpm is not installed on this server (required for backend deploy)" >&2
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "❌ pm2 is not installed on this server (required for backend deploy)" >&2
  exit 1
fi

# Backend: clean install + build. better-sqlite3's native binary is built
# automatically (allowlisted via pnpm.onlyBuiltDependencies in package.json).
# tsc-alias rewrites the @domain/@application/... path aliases in the emitted JS.
cd "$NEST_DIR"
rm -rf node_modules dist
pnpm install --frozen-lockfile
pnpm build

# Start or reload the backend with pm2 (prod env from ecosystem.config.js)
cd "$API_ROOT"
pm2 reload ecosystem.config.js --env production 2>/dev/null || pm2 start ecosystem.config.js --env production
pm2 save
EOF

  trap - ERR

  log "✅ Backend deployment completed successfully"
  log "ℹ️  NestJS backend (port 6400, internal) is running"
  log "ℹ️  SQLite database persists in: $DATA_DIR"
  log "ℹ️  Previous version is available in: $NEST_BACKUP_DIR"
  log "ℹ️  You can manually rollback with: ./backend/deploy-api.sh rollback"
}

rollback() {
  log "↩️  Manual rollback to previous backend version"
  if remote_rollback; then
    log "➡️  Reloading backend with pm2 after rollback"
    restart_pm2
    log "✅ Manual backend rollback completed. Previous version is now live."
  else
    log "❌ Rollback failed. Check server state manually."
    exit 1
  fi
}

######################################
# Script entry point
######################################

ACTION="${1:-deploy}"

case "$ACTION" in
  deploy)
    deploy
    ;;
  rollback)
    rollback
    ;;
  *)
    echo "Usage: $0 [deploy|rollback]"
    exit 1
    ;;
esac
