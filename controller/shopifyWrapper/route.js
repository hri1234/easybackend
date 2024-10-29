// routes/index.js
const express = require('express');
const router = express.Router();
const apiWrapperController = require('./controller');
const { verifyToken } = require('../../middleware/auth');
const { trackApiUsage } = require('../../middleware/apiUsageMiddleWare');

router.get('/subscription-contract/list', (req, res, next) => {
    console.log('Request received at api-wrapper route');
    const body = req.body;
    req.query.limit = body.limit || req.query.limit;
    req.query.offset = body.offset || req.query.offset;
    req.query.sortby = body.sort ? body.sort[0] : req.query.sortby;
    next();
}, verifyToken, trackApiUsage, apiWrapperController.executeApiRequest);
router.patch('/subscription-contract/paused/:id', verifyToken, trackApiUsage, apiWrapperController.pauseSubscription);
router.patch('/subscription-contract/active/:id', verifyToken, trackApiUsage, apiWrapperController.ActiveSubscriptionData);
router.patch('/subscription-contract/skip/:id', verifyToken, trackApiUsage, apiWrapperController.SkipSubscriptionData);
router.patch('/subscription-contract/cancel/:id', verifyToken, trackApiUsage, apiWrapperController.CancelSubscriptionData);
router.put('/subscription-contract/frequency-update', verifyToken, trackApiUsage, apiWrapperController.UpdateSubscriptionFrequency);
router.get('/subscription-contract/swapping-products-list', verifyToken, trackApiUsage, apiWrapperController.AllSwappingProductList);
router.get('/customer/subscriber-list', verifyToken, trackApiUsage, apiWrapperController.AllSubscriptionCustomerList);
router.post('/subscription-group/create', verifyToken, trackApiUsage, apiWrapperController.CreateSubscriptionNewGroup);
router.get('/subscription-group/list', verifyToken, trackApiUsage, apiWrapperController.GetAllKistOfGroup);
router.get('/subscription-contract/upcoming-orders', verifyToken, trackApiUsage, apiWrapperController.AllUpcomingOrder);
router.get('/subscription-contract/orders-history', verifyToken, trackApiUsage, apiWrapperController.AllOrderHistory);
router.get('/subscription-contract/:id', verifyToken, trackApiUsage, apiWrapperController.GetContractById);
router.get('/subscription-contract/order/:id', verifyToken, trackApiUsage, apiWrapperController.GetContractOrderById);
router.get('/subscription-contract/billing-attempt/:id', verifyToken, trackApiUsage, apiWrapperController.GetContractBillingAttemptrById);

module.exports = router;

