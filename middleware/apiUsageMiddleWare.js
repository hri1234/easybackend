// middleware/apiUsageMiddleware.js
const mysql = require('mysql2/promise');
const pool = require('../config/database')

const trackApiUsage = async (req, res, next) => {
    const clientId = req.clientId;
    
    if (!clientId) {
        console.error('Client ID not set');
        return next();
    }

    console.log("Tracking API usage for client:", clientId);
    
    try {
        const [result] = await pool.query(
            'UPDATE storeuser SET api_calls = api_calls + 1 WHERE client_id = ?', 
            [clientId]
        );
        console.log('Rows affected:', result.affectedRows);
        
        if (result.affectedRows === 0) {
            console.warn(`No user found with client_id: ${clientId}`);
        }
    } catch (error) {
        console.error('Error tracking API usage:', error);
    } finally {
        next();
    }
};

module.exports = { trackApiUsage };