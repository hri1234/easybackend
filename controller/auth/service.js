const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateClientId, generateSecretKey, generateCode } = require('../../middleware/utils');
const pool = require('../../config/database')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'itg.donotreply@gmail.com',
    pass: 'suntduvmuohcccwa'
  }
});

exports.createStoreUserTable = async () => {
  try {
    await pool.query(`
     CREATE TABLE IF NOT EXISTS storeuser (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
  temp_password VARCHAR(255),
  shopify_domain VARCHAR(255),
  client_id VARCHAR(255),
  secret_key VARCHAR(255),
  scopes TEXT,
  description TEXT,
  access_token VARCHAR(255),
  customer_payment INT NOT NULL,
  created_at TIMESTAMP
)
    `);
    console.log('Storeuser table created or already exists');
  } catch (error) {
    console.error('Error creating storeuser table:', error);
  }
};

exports.verifyUserService = async (email, shopifyDomain) => {
  const [userRows] = await pool.query(
    'SELECT * FROM storeuser WHERE email = ? AND password IS NOT NULL',
    [email]
  );

  if (userRows.length > 0) {
    return { status: 'success', message: 'You are already registered. Please login.', redirect: 'login' };
  }

  const [storeRows] = await pool.query(
    'SELECT * FROM store_details WHERE email = ? AND myshopify_domain = ?',
    [email, shopifyDomain]
  );

  if (storeRows.length === 0) {
    return { status: 'error', message: 'User not available in store_details' };
  }

  const tempPassword = Math.random().toString(36).slice(-8);
  const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

  await pool.query(
    'INSERT INTO storeuser (email, shopify_domain, temp_password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE temp_password = ?',
    [email, shopifyDomain, hashedTempPassword, hashedTempPassword]
  );

  const setPasswordLink = `http://localhost:3000/set-password?email=${encodeURIComponent(email)}&tempPassword=${encodeURIComponent(tempPassword)}`;

  await transporter.sendMail({
    from: 'itg.donotreply@gmail.com',
    to: email,
    subject: 'Set Your Password',
    html: `
      <p>Click the following link to set your password:</p>
      <a href="${setPasswordLink}">${setPasswordLink}</a>
    `
  });

  return { status: 'success', message: 'Password reset link sent' };
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

  return { status: 'success', message: 'Password updated successfully' };
};

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
      name: rows[0].name
    }
  };
};

exports.registerApp = async (name, shopifyDomain, email, description) => {
  const clientId = generateClientId();
  const secretKey = generateSecretKey();
  const scopes = 'read_products,write_products';

  try {
    const [userResult] = await pool.query(
      'SELECT * FROM storeuser WHERE shopify_domain = ?',
      [shopifyDomain]
    );

    if (userResult.length === 0) {
      // If the shopify_domain doesn't exist, insert a new record
      const [insertResult] = await pool.query(
        'INSERT INTO storeuser (name,shopify_domain, client_id, secret_key, scopes, description) VALUES (?, ?, ?, ?, ?, ?)',
        [name, shopifyDomain, clientId, secretKey, scopes, description]
      );
      return { 
        message: 'App registered successfully', 
        clientId, 
        secretKey, 
        scopes,
        id: insertResult.insertId,
        shopifyDomain,
      };
    } else {
      // If the shopify_domain exists, update the record
      const userId = userResult[0].id;
      await pool.query(
        'UPDATE storeuser SET name = ?, client_id = ?, secret_key = ?, scopes = ?, description = ? WHERE shopify_domain = ?',
        [name, clientId, secretKey, scopes, description, shopifyDomain]
      );

      return { 
        message: 'App updated successfully', 
        clientId, 
        secretKey, 
        scopes,
        id: userId,
        name,
        shopifyDomain
      };
    }
  } catch (error) {
    console.error('Error registering/updating app:', error);
    throw error;
  }
};

exports.getUserDetails = async (clientId) => {
  console.log("clientId-----------------", clientId);
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, shopify_domain, client_id, secret_key, scopes, description, api_calls 	access_token,created_at FROM storeuser WHERE client_id = ?',
      [clientId]
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
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  try {
    const [existingClient] = await pool.query(
      'SELECT * FROM auth_codes WHERE client_id = ?',
      [clientId]
    );

    if (existingClient.length > 0) {
      await pool.query(
        'UPDATE auth_codes SET code = ?, expires_at = ? WHERE client_id = ?',
        [code, expiresAt, clientId]
      );
    } else {
      await pool.query(
        'INSERT INTO auth_codes (client_id, code, expires_at) VALUES (?, ?, ?)',
        [clientId, code, expiresAt]
      );
    }
    console.log("this is a data value", code);
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

    const refreshToken = jwt.sign({ clientId }, "yUUYUG67873FFDTUUE83FFDDLLFIIFN", { expiresIn: '60d' });
    console.log("this is refreshtoken---------------------", refreshToken);
    const accessToken = jwt.sign({ clientId }, "yUUYUG67873FFDTUUE83FFDDLLFIIFN", { expiresIn: '1h' });
    console.log("this is a acessToken Data---------------", accessToken);

    await pool.query('DELETE FROM auth_codes WHERE code = ?', [code]);

    const [existingToken] = await pool.query('SELECT * FROM tokens WHERE client_id = ?', [clientId]);

    if (existingToken.length > 0) {
      await pool.query(
        'UPDATE tokens SET refresh_token = ?, access_token = ? WHERE client_id = ?',
        [refreshToken, accessToken, clientId]
      );
    } else {
      await pool.query(
        'INSERT INTO tokens (client_id, refresh_token, access_token) VALUES (?, ?, ?)',
        [clientId, refreshToken, accessToken]
      );
    }

    return { refreshToken, accessToken };
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw error;
  }
};

exports.refreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, "yUUYUG67873FFDTUUE83FFDDLLFIIFN");
    const accessToken = jwt.sign({ clientId: decoded.clientId }, "yUUYUG67873FFDTUUE83FFDDLLFIIFN", { expiresIn: '1h' });

    const [existingToken] = await pool.query('SELECT * FROM tokens WHERE refresh_token = ?', [refreshToken]);

    if (existingToken.length > 0) {
      await pool.query(
        'UPDATE tokens SET access_token = ? WHERE refresh_token = ?',
        [accessToken, refreshToken]
      );
    } else {
      await pool.query(
        'INSERT INTO tokens (client_id, refresh_token, access_token) VALUES (?, ?, ?)',
        [decoded.clientId, refreshToken, accessToken]
      );
    }

    return { accessToken };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

exports.getAllStoreUsers = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, shopify_domain, email, client_id, secret_key, scopes, description, api_calls ,created_at FROM storeuser '
    );
    
    if (rows.length === 0) {
      return { message: "No store users with generated client_id found." };
    }
    
    return rows;
  } catch (error) {
    console.error('Error fetching all store users:', error);
    throw error;
  }
};

exports.deleteStoreUser = async (clientId) => {
  try {
    const [result] = await pool.query(
      'UPDATE storeuser SET client_id = NULL WHERE client_id = ?',
      [clientId]
    );

    if (result.affectedRows === 0) {
      throw new Error('Store user with provided client_id not found');
    }

    return { message: 'Client ID removed successfully from store user' };
  } catch (error) {
    console.error('Error removing client ID from store user:', error);
    throw error;
  }
};