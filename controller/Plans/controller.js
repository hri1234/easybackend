const adminEsaPlansService = require('./service');

const getAllPlans = async (req, res, next) => {
  try {
    const plans = await adminEsaPlansService.getAllPlans();
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

const healthCheck = (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
};

module.exports = {
  getAllPlans,
  healthCheck
};