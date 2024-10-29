const express = require('express');
const adminEsaPlansController = require('./controller');

const router = express.Router();

router.get('/health', adminEsaPlansController.healthCheck);
router.get('/admin-esa-plans', adminEsaPlansController.getAllPlans);

module.exports = router;