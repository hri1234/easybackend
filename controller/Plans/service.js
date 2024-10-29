const pool = require('../../config/database');

const getAllPlans = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM admin_esa_plans');
    return rows;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllPlans
};