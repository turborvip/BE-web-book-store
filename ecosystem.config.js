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
  deploy : {
  production : {
    user : 'node',
    host : 'xx.xx.xx.xx',
    ref  : 'origin/master',
    repo : 'git@github.com:turborvip/BE-web-book-store.git',
    path : '/var/www/production',
    'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
  }
}
}