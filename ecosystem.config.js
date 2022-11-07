module.exports = {
  apps: [{
    name: 'BE-book-store',
    script: 'npm run strapi start',
    node_args: ["--max_old_space_size=512"],

    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
}