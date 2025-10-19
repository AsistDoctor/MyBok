const config = {
    development: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        cors: {
            origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
            credentials: true
        },
        logging: true
    },
    production: {
        port: process.env.PORT || 8080,
        host: process.env.HOST || '0.0.0.0',
        cors: {
            origin: process.env.FRONTEND_URL || 'https://your-domain.com',
            credentials: true
        },
        logging: false
    }
};

const env = process.env.NODE_ENV || 'development';

module.exports = config[env];