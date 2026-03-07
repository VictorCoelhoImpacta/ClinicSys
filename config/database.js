const { Pool } = require('pg');

const pool = new Pool({
    user: 'coelho',
    host: 'localhost',
    database: 'clinica',
    password: '123',
    port: 5432,
});

module.exports = pool;
