module.exports = {
 apps: [
   {
     name: 'creatorbounty',
     script: 'wsgi.py',
     interpreter: '/var/www/cbounty/backend/venv/bin/python',
     cwd: '/var/www/cbounty/backend',
     instances: 1,
     exec_mode: 'fork',
     autorestart: true,
     watch: false,
     max_memory_restart: '500M', 
     env: {
       NODE_ENV: 'production',
       PYTHONPATH: '/var/www/cbounty/backend',
       PYTHONUNBUFFERED: '1',
       VIRTUAL_ENV: '/var/www/cbounty/backend/venv',
       PATH: '/var/www/cbounty/backend/venv/bin:' + process.env.PATH
     },
     error_file: '/var/www/cbounty/backend/logs/pm2-error.log',
     out_file: '/var/www/cbounty/backend/logs/pm2-out.log',
     log_file: '/var/www/cbounty/backend/logs/pm2-combined.log',
     time: true,
     log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
     merge_logs: true,
     kill_timeout: 10000,
     listen_timeout: 8000,
     restart_delay: 4000,
     max_restarts: 10,
     min_uptime: '10s'
   }
 ]
}; 