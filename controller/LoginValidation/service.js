const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateClientId, generateSecretKey, generateCode } = require('../../middleware/utils');
const pool = require("../../config/database");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'itg.donotreply@gmail.com',
    pass: 'suntduvmuohcccwa'
  }
});

exports.verifyUserService = async (email, shopifyDomain) => {
    console.log("This is a data of shopifydomian , email------------------", email, shopifyDomain)
    const [adminRows] = await pool.query(
        'SELECT * FROM storeuser WHERE email = ? AND password IS NOT NULL AND shopify_domain = ?',
        [email, shopifyDomain]
    );
  
    if (adminRows.length > 0) {
        const customerPaymentStatus = adminRows[0].customer_payment_status;
        console.log("this is a adminRows data - -------------------" , adminRows)
        
        if (customerPaymentStatus === 2 || customerPaymentStatus===0) {
            return { 
                status: 'error', 
                message: 'Your payment has not been done',
                customer_payment_status: customerPaymentStatus
            };
        } else if (customerPaymentStatus !== 1 && customerPaymentStatus !== 3) {
            return { 
                status: 'error', 
                message: 'Invalid payment status',
                customer_payment_status: customerPaymentStatus
            };
        }

        return { 
            status: 'success/bro', 
            message: 'You are already registered. Please login.', 
            redirect: 'login',
            customer_payment_status: customerPaymentStatus
        };
    }
  
    const [storeRows] = await pool.query(
        'SELECT * FROM store_details WHERE email = ? AND myshopify_domain = ?',
        [email, shopifyDomain]
    );
  
    if (storeRows.length === 0) {
        return { status: 'error', message: 'User not available' };
    }
  
    const [sessionRows] = await pool.query(
        'SELECT accessToken FROM shopify_sessions WHERE shop = ?',
        [shopifyDomain]
    );
    console.log("session Data-------------------", sessionRows)
  
    if (sessionRows.length === 0 || !sessionRows[0].accessToken) {
        return { status: 'error', message: 'Access token not found for this store' };
    }
  
    const accessToken = sessionRows[0].accessToken;
    console.log("this is a accessToken---------------", accessToken)
  
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
  
    await pool.query(
        'INSERT INTO storeuser (email, shopify_domain, temp_password, access_token, customer_payment_status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE temp_password = ?, shopify_domain = ?, access_token = ?',
        [email, shopifyDomain, hashedTempPassword, accessToken, 0, hashedTempPassword, shopifyDomain, accessToken]
    );
  
    const setPasswordLink = `http://localhost:3000/set-password?email=${encodeURIComponent(email)}&tempPassword=${encodeURIComponent(tempPassword)}`;
  
    await transporter.sendMail({
      from: 'noreply@easysubscription.com',
      to: 'hritikpandey@itgeeks.com', 
      subject: 'Welcome to EasySubscription - Set Your Password',
      html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Set Your EasySubscription Password</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      color: #333;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #f9f9f9;
                      border-radius: 5px;
                  }
                  .header {
                      text-align: center;
                      margin-bottom: 20px;
                  }
                  .logo {
                      max-width: 200px;
                  }
                  h1 {
                      color: #2c3e50;
                  }
                  .content {
                      background-color: #ffffff;
                      padding: 20px;
                      border-radius: 5px;
                  }
                  .button {
                      display: inline-block;
                      padding: 10px 20px;
                      background-color: black;
                      text-decoration: none;
                      border-radius: 5px;
                      margin-top: 20px;
                  }
                  .button span {
                      color: white;
                  }
                  .footer {
                      margin-top: 20px;
                      text-align: center;
                      font-size: 0.8em;
                      color: #7f8c8d;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Xx3g2PT6iplO5APpGmvNiuSr3XjyWz1vNg&s" alt="EasySubscription Logo" class="logo">
                      <h1>Welcome to EasySubscription!</h1>
                  </div>
                  <div class="content">
                      <p>Hello,</p>
                      <p>Thank you for choosing EasySubscription. To get started, please set your password by clicking the button below:</p>
                      <p style="text-align: center;">
                          <a href="${setPasswordLink}" class="button">
                              <span>Set Your Password</span>
                          </a>
                      </p>
                      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
                      <p>${setPasswordLink}</p>
                      <p>We are always here to help you, so feel free to reach us.</p>
                      <p>This link will expire in 24 hours for security reasons.</p>
                      <p>If you didn't request this email, please ignore it or contact our support team.</p>
                      <p>Best regards,<br>The EasySubscription Team</p>
                  </div>
                  <div class="footer">
                      <p>&copy; 2024 EasySubscription. All rights reserved.</p>
                      <p>123 Subscription St., Tech City, TC 12345</p>
                  </div>
              </div>
          </body>
          </html>
      `
  });
  
    return { 
        status: 'success', 
        message: 'Password reset link sent',
        customer_payment_status: 0
    };
};

exports.setPasswordService = async (email, tempPassword, newPassword) => {
  const [rows] = await pool.query(
    'SELECT * FROM storeuser WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return { status: 'error', message: 'Invalid email' };
  }

  const isValid = await bcrypt.compare(tempPassword, rows[0].temp_password);

  if (!isValid) {
    return { status: 'error', message: 'Invalid temporary password' };
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    'UPDATE storeuser SET password = ?, temp_password = NULL WHERE email = ?',
    [hashedNewPassword, email]
  );

  // Send success email
  await sendSuccessEmail(email);

  return { status: 'success', message: 'Password updated successfully' };
};

async function sendSuccessEmail(email) {
  const successEmailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created Successfully - EasySubscription</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 5px;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo {
                max-width: 200px;
            }
            h1 {
                color: #2c3e50;
            }
            .content {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: black;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 0.8em;
                color: #7f8c8d;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Xx3g2PT6iplO5APpGmvNiuSr3XjyWz1vNg&s" alt="EasySubscription Logo" class="logo">
                <h1>Account Created Successfully!</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Great news! Your EasySubscription account has been successfully created.</p>
                <p>You can now log in to your account and start using our services.</p>
               <p style="text-align: center;">
                          <a href="http://localhost:3000/login" class="button">
                              <span style="color:white;">Login To Your Account</span>
                          </a>
                      </p>
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                <p>Thank you for choosing EasySubscription!</p>
                <p>Best regards,<br>The EasySubscription Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 EasySubscription. All rights reserved.</p>
                <p>123 Subscription St., Tech City, TC 12345</p>
            </div>
        </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: 'noreply@easysubscription.com',
    to: 'hritikpandey@itgeeks.com',
    subject: 'Welcome to EasySubscription - Account Created Successfully',
    html: successEmailTemplate
  });
}

exports.loginService = async (email, password) => {
  const [rows] = await pool.query(
    'SELECT * FROM storeuser WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return { status: 'error', message: 'Invalid credentials' };
  }

  const isValid = await bcrypt.compare(password, rows[0].password);

  if (!isValid) {
    return { status: 'error', message: 'Invalid credentials' };
  }

  const token = jwt.sign({ email, id: rows[0].id }, "yUUYUG67873FFDTUUE83FFDDLLFIIFN", { expiresIn: '1h' });

  return { 
    status: 'success', 
    token,
    user: {
      id: rows[0].id,
      email: rows[0].email,
      shopifyDomain: rows[0].shopify_domain,
      name: rows[0].name,
      customer_payment_status: rows[0].customer_payment_status
    }
  };
};

exports.registerApp = async (userId, name, description) => {
  const clientId = generateClientId();
  const secretKey = generateSecretKey();
  const scopes = 'read_products,write_products';

  try {
    await pool.query(
      'UPDATE storeuser SET name = ?, client_id = ?, secret_key = ?, scopes = ?, description = ? WHERE id = ?',
      [name, clientId, secretKey, scopes, description, userId]
    );

    return { message: 'App registered successfully', clientId, secretKey, scopes };
  } catch (error) {
    console.error('Error registering app:', error);
    throw error;
  }
};

exports.getUserDetails = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, shopify_domain, client_id, secret_key, scopes, description, created_at FROM storeuser WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      throw new Error('User not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

exports.generateCode = async (clientId) => {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

  try {
    await pool.query(
      'INSERT INTO auth_codes (client_id, code, expires_at) VALUES (?, ?, ?)',
      [clientId, code, expiresAt]
    );

    return { code, expiresAt };
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};

exports.exchangeToken = async (code, clientId, secretKey) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM auth_codes WHERE code = ? AND client_id = ? AND expires_at > NOW()',
      [code, clientId]
    );

    if (rows.length === 0) {
      throw new Error('Invalid or expired code');
    }

    const [userRows] = await pool.query(
      'SELECT * FROM storeuser WHERE client_id = ? AND secret_key = ?',
      [clientId, secretKey]
    );

    if (userRows.length === 0) {
      throw new Error('Invalid client_id or secret_key');
    }

    const refreshToken = jwt.sign({ clientId }, process.env.JWT_SECRET, { expiresIn: '60d' });
    const accessToken = jwt.sign({ clientId }, process.env.JWT_SECRET, { expiresIn: '1h'});

    await pool.query('DELETE FROM auth_codes WHERE code = ?', [code]);
    await pool.query(
      'INSERT INTO tokens (client_id, refresh_token, access_token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE refresh_token = ?, access_token = ?',
      [clientId, refreshToken, accessToken, refreshToken, accessToken]
    );

    return { refreshToken, accessToken };
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw error;
  }
};

exports.refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign({ clientId: decoded.clientId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await pool.query(
      'UPDATE tokens SET access_token = ? WHERE refresh_token = ?',
      [accessToken, refreshToken]
    );

    return { accessToken };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

exports.getAllStoreUsers = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, shopify_domain, email, client_id, secret_key, scopes, description, created_at FROM storeuser'
    );
    return rows;
  } catch (error) {
    console.error('Error fetching all store users:', error);
    throw error;
  }
};

exports.deleteStoreUser = async (userId) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM storeuser WHERE id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Store user not found');
    }

    // Also delete related records in other tables
    await pool.query('DELETE FROM auth_codes WHERE client_id = (SELECT client_id FROM storeuser WHERE id = ?)', [userId]);
    await pool.query('DELETE FROM tokens WHERE client_id = (SELECT client_id FROM storeuser WHERE id = ?)', [userId]);

    return { message: 'Store user and related data deleted successfully' };
  } catch (error) {
    console.error('Error deleting store user:', error);
    throw error;
  }
};