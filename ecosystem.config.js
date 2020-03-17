module.exports = {
    apps : [{
      name: 'Autoplanet Captacion Back',
      script: 'npm',
      args: 'run prod',
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
        user : 'ec2-user',
        host : '54.191.66.41',
        ref  : 'origin/develop',
        repo : 'git@github.com:fcabezas-ingetelma/autoplanet_captacion_back.git',
        path : '/home/ec2-user/autoplanet_captacion_back',
        key  : '../aws_keys/autoplanet_back.pem',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
      }
    }
  };
  