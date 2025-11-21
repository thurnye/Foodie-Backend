/**
 * PM2 Process Manager Configuration
 * Start all services: pm2 start ecosystem.config.js
 * Stop all: pm2 stop ecosystem.config.js
 * Restart all: pm2 restart ecosystem.config.js
 * View logs: pm2 logs
 * Monitor: pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'api-gateway/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'auth-service',
      script: 'services/auth-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'user-service',
      script: 'services/user-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
    {
      name: 'recipe-service',
      script: 'services/recipe-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3003,
      },
    },
    // Phase 2 services (commented out until implemented)
    /*
    {
      name: 'event-service',
      script: 'services/event-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3004,
      },
    },
    {
      name: 'community-service',
      script: 'services/community-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3005,
      },
    },
    {
      name: 'group-service',
      script: 'services/group-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3006,
      },
    },
    {
      name: 'chat-service',
      script: 'services/chat-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3007,
      },
    },
    {
      name: 'news-service',
      script: 'services/news-service/dist/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'development',
        PORT: 3008,
      },
    },
    */
  ],
};
