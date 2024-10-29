const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: "146.190.2.176"||process.env.DB_HOST,
    user: "root"||process.env.DB_USER,
    password: "Itgeek@2023"||process.env.DB_PASSWORD,
    database: "easysubscription"||process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;