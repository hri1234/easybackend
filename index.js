const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const login = require("./controller/LoginValidation/route")
const auth = require("./controller/auth/route");
const verify = require("./controller/shopifyWrapper/route")
const discount = require("./controller/discount/route");
const plan = require("./controller/Plans/route")

const app = express();
app.use(cors());
app.use(express.json());

async function startServer() {
  try {

    const pool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    global.pool = pool;

    // Use routes
    app.use('/adminapi/auth', auth);
    app.use("/adminapi/api", login);
    app.use("/adminapi/api", verify);
    app.use("/adminapi/discount", discount);
    app.use("/adminapi/plan", plan);

    if (process.env.NODE_ENV === 'production') {
      // Serve static files from the React frontend app
      app.use(express.static(path.join(__dirname, 'template', 'build')));
    
      // Handles any requests that don't match the ones above
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'template', 'build', 'index.html'));
      });
    } else {
      console.log('Running in development mode');
    }

    const PORT = process.env.PORT;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();