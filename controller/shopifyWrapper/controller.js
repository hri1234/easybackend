// controllers/apiWrapperController.js
const authService = require('../auth/service');
const apiWrapperService = require('./service');

// Controller Code
exports.executeApiRequest = async (req, res) => {
    try {
        const { clientId } = req;
        const method = req.method;
        const param = req.params;
        const id = req.params.id;
        const body = req.body;
        
        const endpoint = 'raw_data'       
       
        console.log("this is a body:--------------------", body);
        console.log("this is a contract Id:--------------------", id);
        console.log("this is data new in params ---------------------", param);

        const userDetails = await authService.getUserDetails(clientId);
        console.log("User details:--------------------------", userDetails);

        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.executeApiRequest(
            userDetails.shopify_domain,
            req.headers['authorization'],
            method,
            body,
            endpoint,
            id,
            req.query
        );

        res.json(result);
    } catch (error) {
        console.error('Execute API request error:', error);
        res.status(500).json({ error: 'Failed to execute API request', details: error.message });
    }
};

exports.pauseSubscription = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.pauseSubscription(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('Pause subscription error:', error);
        res.status(500).json({ error: 'Failed to pause subscription', details: error.message });
    }
};

exports.ActiveSubscriptionData = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.ActiveSubscriptionData(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('Pause subscription error:', error);
        res.status(400).json({ error: 'Failed to Active subscription', details: error.message });
    }
};

exports.SkipSubscriptionData = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.SkipSubscriptionData(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('Skip subscription error:', error);
        res.status(500).json({ error: 'Failed to pause subscription', details: error.message });
    }
};

exports.CancelSubscriptionData = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.CancelSubscriptionData(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(403).json({ error: 'Failed to Cancel subscription', details: error.message });
    }
};

exports.UpdateSubscriptionFrequency = async (req, res) => {
    console.log("this id update id in req.body---------------------------" , req.body)
    try {
        const { clientId } = req;
       const newContractData = req.body
       console.log("this will id come as reuest-----------", newContractData)

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.UpdateSubscriptionFrequency(
            userDetails.shopify_domain,
            req.headers['authorization'],
            newContractData
        );

        res.json(result);
    } catch (error) {
        console.error('Update subscription error:', error);
        res.status(500).json({ error: 'Failed to Update subscription', details: error.message });
    }
};

exports.AllOrderHistory = async (req, res) => {
    console.log("step1---------------------------------------------")
    console.log("step1---------------------------------------------")
    console.log("step1---------------------------------------------")
    console.log("step1---------------------------------------------")
    console.log("step1---------------------------------------------")
    console.log("this id update id in req.body---------------------------" , req.body)
    try {
        const { clientId } = req;
       const OrderHistory = req.body
       console.log("this will order history data come as reuest-----------", OrderHistory)

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.AllOrderHistory(
            userDetails.shopify_domain,
            req.headers['authorization'],
            OrderHistory
        );

        res.json(result);
    } catch (error) {
        console.error('All Order subscription error:', error);
        res.status(500).json({ error: 'Failed to get Orders subscription', details: error.message });
    }
};

exports.AllUpcomingOrder = async (req, res) => {
    console.log("this id update id in req.body---------------------------" , req.body)
    try {
        const { clientId } = req;
       const UpcomingOrder = req.body
       console.log("this will order Futare data come as reuest-----------", UpcomingOrder)

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.AllUpcomingOrder(
            userDetails.shopify_domain,
            req.headers['authorization'],
            UpcomingOrder
        );

        res.json(result);
    } catch (error) {
        console.error('All upcoming subscription error:', error);
        res.status(500).json({ error: 'Failed to pause subscription', details: error.message });
    }
};

exports.AllSwappingProductList = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.AllSwappingProductList(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('Pause subscription error:', error);
        res.status(400).json({ error: 'Failed to pause subscription', details: error.message });
    }
};

exports.AllSubscriptionCustomerList = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.AllSubscriptionCustomerList(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('customer subscription error:', error);
        res.status(400).json({ error: 'Failed to get Subscription customer subscription', details: error.message });
    }
};

exports.CreateSubscriptionNewGroup = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;
        const data = req.body


        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.CreateSubscriptionNewGroup(
            id,
            userDetails.shopify_domain,
            req.headers['authorization'],
            data
        );

        res.json(result);
    } catch (error) {
        console.error('Pause subscription error:', error);
        res.status(400).json({ error: 'Failed to pause subscription', details: error.message });
    }
};

exports.GetAllKistOfGroup = async (req, res) => {
    try {
        const { clientId } = req;
        const data = req.body


        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.GetAllKistOfGroup(
            userDetails.shopify_domain,
            req.headers['authorization'],
            data
        );

        res.json(result);
    } catch (error) {
        console.error('All group subscription error:', error);
        res.status(400).json({ error: 'Failed to get Group subscription', details: error.message });
    }
};

exports.GetContractById = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;

        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.GetContractById(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('get subscription error:', error);
        res.status(400).json({ error: 'Failed to get subscription', details: error.message });
    }
};


exports.GetContractOrderById = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;
console.log("yhis is orderID OF cONTRAT" , id)
        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.GetContractOrderById(
            id,
            userDetails.shopify_domain,
            req.headers['authorization']
        );

        res.json(result);
    } catch (error) {
        console.error('get subscription order error:', error);
        res.status(400).json({ error: 'Failed to get subscription order', details: error.message });
    }
};


exports.GetContractBillingAttemptrById = async (req, res) => {
    try {
        const { clientId } = req;
        const { id } = req.params;
console.log("yhis is orderID OF cONTRAT" , id)
        const userDetails = await authService.getUserDetails(clientId);
        if (!userDetails) {
            return res.status(404).json({ error: 'User not found' });
        }

        const result = await apiWrapperService.GetContractBillingAttemptrById(
            id,
            userDetails.shopify_domain,
            req.headers['authorization'],
        );

        res.json(result);
    } catch (error) {
        console.error('get subscription Billing Attempt error:', error);
        res.status(400).json({ error: 'Failed to get subscription', details: error.message });
    }
};