/**
 * English UI strings — the single source of truth for user-facing text.
 *
 * This is a plain data module (no React, no browser APIs) so it imports cleanly
 * into both server components (e.g. page `metadata`) and client components.
 *
 * Multilingual later: add a sibling locale (e.g. `fr.ts`) typed as `Dictionary`
 * (see ./index) and the compiler will require it to match this shape key-for-key.
 * Do NOT add `as const` here — values must stay widened to `string` so other
 * locales can supply their own text rather than being pinned to these literals.
 */
export const en = {
  common: {
    brand: "1991CHAT",
    appName: "1991chat",
    tagline: "AI chat",
  },

  nav: {
    chat: "Chat",
    about: "About",
    changePassword: "Change password",
    signOut: "Sign out",
    login: "Login",
    signup: "Signup",
  },

  auth: {
    login: {
      title: "Sign in to continue",
      username: "Username",
      password: "Password",
      submit: "Sign in",
      submitLoading: "Signing in…",
      error: "Login failed",
      noAccount: "No account?",
      signupCta: "Sign up",
    },
    signup: {
      heading: "Create your account",
      subtitle: "Sign up to start chatting",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm password",
      mismatch: "Passwords do not match",
      submit: "Sign up",
      submitLoading: "Creating account…",
      error: "Sign up failed",
      haveAccount: "Already have an account?",
      loginCta: "Log in",
    },
    changePassword: {
      heading: "Change password",
      subtitle: "Update the password for your account",
      username: "Username",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password",
      mismatch: "New passwords do not match",
      success: "Password changed.",
      error: "Could not change password",
      submit: "Change password",
      submitLoading: "Saving…",
    },
    passwordInput: {
      show: "Show password",
      hide: "Hide password",
    },
  },

  chat: {
    composerPlaceholder: "Send a message…",
    send: "Send",
    conversations: "Conversations",
  },

  shell: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },

  about: {
    heading: "About",
    hosting: "Site hébergé chez OVH SAS",
    address: "Siège social : 2 rue Kellermann — 59100 Roubaix — France",
    ape: "Code APE 2620Z",
    vat: "N° TVA : FR 22 424 761 419",
  },

  meta: {
    aboutTitle: "About — 1991chat",
    changePasswordTitle: "Change password — 1991chat",
  },
};
