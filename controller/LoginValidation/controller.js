const { validationResult } = require('express-validator');
const { verifyUserService, setPasswordService, loginService } = require('./service');

exports.verifyUser = async (req, res) => {
  const { email, shopifyDomain } = req.query;

  if (!email || !shopifyDomain) {
    return res.status(400).json({ status: 'error', message: 'Email and Shopify domain are required' });
  }

  try {
    const result = await verifyUserService(email, shopifyDomain);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.setPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  const { email, tempPassword, newPassword } = req.body;

  try {
    const result = await setPasswordService(email, tempPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await loginService(email, password);
    if (result.status === 'success') {
      res.json({ status: 'success', token: result.token, user: result.user });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};