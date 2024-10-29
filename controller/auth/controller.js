const authService = require('./service');

exports.register = async (req, res) => {
  try {
    const { name, shopifyDomain, email, description } = req.body;
    console.log("req.body.Hritik..................", req.body);
    const result = await authService.registerApp(name, shopifyDomain, email, description);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

exports.generateCode = async (req, res) => {
  try {
    const { clientId } = req.body;
    console.log("this is data----------------------------" , req.body)
    const result = await authService.generateCode(clientId);
    console.log("result data---------",result)
    res.json(result);
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ error: 'Code generation failed', details: error.message });
  }
};

exports.exchangeToken = async (req, res) => {
  try {
    const { code, clientId, secretKey } = req.body;
    console.log("this is all details of code , clintid , secretKey------------------" , code , clientId , secretKey)
    const result = await authService.exchangeToken(code, clientId, secretKey);
    res.json(result);
  } catch (error) {
    console.error('Token exchange error:', error);
    if (error.message === 'Invalid or expired code') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Token exchange failed', details: error.message });
    }
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    console.log("this is refresh token----------------------" , refreshToken)
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token', details: error.message });
  }
};

exports.getStoreUser = async (req, res) => {
  try {
    const { clientId } = req.params;
    const storeUser = await authService.getUserDetails(clientId);
    res.json(storeUser);
  } catch (error) {
    console.error('Get store user error:', error);
    if (error.message === 'Store user not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch store user data' });
    }
  }
};

exports.getAllStoreUsers = async (req, res) => {
  try {
    const storeUsers = await authService.getAllStoreUsers();
    res.json(storeUsers);
  } catch (error) {
    console.error('Get all store users error:', error);
    res.status(500).json({ error: 'Failed to fetch all store users data' });
  }
};

exports.deleteStoreUser = async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await authService.deleteStoreUser(clientId);
    res.json(result);
  } catch (error) {
    console.error('Delete store user error:', error);
    if (error.message === 'Store user not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete store user', details: error.message });
    }
  }
};