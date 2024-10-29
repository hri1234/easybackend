// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const pool = require("../config/database")

const verifyToken = async (req, res, next) => {
    console.log("Headers data:", req.headers);
    const bearerHeader = req.headers['authorization'];
    console.log("Bearer Token:", bearerHeader);
    
    if (!bearerHeader) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    try {
        const decoded = jwt.verify(token, "yUUYUG67873FFDTUUE83FFDDLLFIIFN");
        console.log("decoed---------------",decoded)
        const [rows] = await pool.query('SELECT * FROM tokens JOIN storeuser ON tokens.client_id = storeuser.client_id WHERE tokens.access_token = ?', [token]);
        console.log("Database result--------------------------:", rows);
        
        if (rows.length === 0) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.clientId = decoded.clientId;
        req.shopifyDomain = rows[0].shopify_domain;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Failed to authenticate token' });
    }
};

module.exports = { verifyToken };