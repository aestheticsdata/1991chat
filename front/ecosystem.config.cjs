module.exports = {
  apps: [
    {
      name: '1991chat-front',
      cwd: __dirname,
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 6401 -H 127.0.0.1',
      interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: '6401',
        HOST: '127.0.0.1',
        // Server-side only — never sent to the browser. The BFF (app/api/*)
        // proxies to the internal NestJS backend on the same host.
        BACKEND_URL: 'http://127.0.0.1:6400',
      },
    },
  ],
};
