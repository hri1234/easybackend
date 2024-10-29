const express = require('express');
const { body } = require('express-validator');
const { verifyUser, setPassword, login } = require('./controller');

const router = express.Router();

router.get('/verify', verifyUser);

router.post('/set-password', [
  body('email').isEmail().normalizeEmail(),
  body('tempPassword').isLength({ min: 8 }),
  body('newPassword').isLength({ min: 8 }),
], setPassword);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], login);

module.exports = router;