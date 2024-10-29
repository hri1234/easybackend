const express = require('express');
const router = express.Router();
const authController = require('./controller');


router.post('/register', authController.register);
router.post('/generate-code', authController.generateCode);
router.post('/token', authController.exchangeToken);
router.post('/refresh-token', authController.refreshToken);
// router.get('/store-user/:clientId', authController.getStoreUser);
router.get('/store-users', authController.getAllStoreUsers);
router.delete('/store-user/:clientId', authController.deleteStoreUser);

module.exports = router;