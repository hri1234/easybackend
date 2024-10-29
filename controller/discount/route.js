const express = require('express');
const discountController = require('./controller');
const router = express.Router();

router.post('/discounts', discountController.createDiscount);
router.get('/discounts/:code', discountController.getDiscount);
router.post('/discounts/use', discountController.useDiscount);
router.post('/discounts/check', discountController.checkDiscount);
router.delete('/discounts/:discountId', discountController.deleteDiscount);
router.put('/editdiscounts/:discountId', discountController.updateDiscount);
router.get('allplan/plans', discountController.getAllPlansDataa);
router.get('/discounts', discountController.getAllDiscounts);
router.get('/discountbyid/:id', discountController.getDiscountById);
router.get("/usediscounts/all" , discountController.getAllUsedDiscounts)

module.exports = router;