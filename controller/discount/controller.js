const discountService = require('./service');

async function createDiscount(req, res) {
  try {
    const discountId = await discountService.createDiscount(req.body);
    console.log("this is a full data in req.body--------------------", discountId)
    res.status(201).json({ id: discountId, message: 'Discount created successfully' });
  } catch (error) {
    console.log("we got Error----------------------",error)
    res.status(500).json({ error: 'Failed to create discount' });
  }
}

async function getDiscount(req, res) {
  try {
    const discount = await discountService.getDiscountByCode(req.params.code);
    console.log("this data will comes in discount------------------" , discount)
    if (discount) {
      res.json(discount);
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get discount' });
  }
}

async function getDiscountById(req, res) {
    console.log("discount get by req.params data-------------------" , req.params.id)
    try {
      const discount = await discountService.getDiscountById(req.params.id);
      if (discount) {
        res.json(discount);
      } else {
        res.status(404).json({ error: 'Discount not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to get discount' });
    }
  }

async function useDiscount(req, res) {
    try {
      const { discountCode, shopifyDomain } = req.body;
      console.log("useDiscount request body:--------------", req.body);
  
      if (!discountCode || !shopifyDomain) {
        return res.status(400).json({ error: 'Discount code and Shopify domain are required' });
      }
  
      const discount = await discountService.getDiscountByCode(discountCode);
      console.log("Discount found:", discount);
  
      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }
  
      const checkResult = await discountService.checkDiscount(discountCode, shopifyDomain);
      console.log("Check discount result:", checkResult);
  
      if (!checkResult.valid) {
        return res.status(400).json({ error: checkResult.message });
      }
  
      const usedDiscountId = await discountService.useDiscount(discount.id, shopifyDomain);
      res.status(201).json({ id: usedDiscountId, message: 'Discount used successfully' });
    } catch (error) {
      console.error("Error in useDiscount controller:", error);
      res.status(500).json({ error: 'Failed to use discount', details: error.message });
    }
  }

async function checkDiscount(req, res) {
    try {
      const { discountCode, shopifyDomain } = req.body;
      if (!discountCode || !shopifyDomain) {
        return res.status(400).json({ error: 'Discount code and Shopify domain are required' });
      }
      const result = await discountService.checkDiscount(discountCode, shopifyDomain);
      if (result.valid) {
        res.json({ valid: true, discount: result.discount });
      } else {
        res.json({ valid: false, message: result.message });
      }
    } catch (error) {
      console.error('Error in checkDiscount:', error);
      res.status(500).json({ error: 'Failed to check discount', details: error.message });
    }
  }

async function deleteDiscount(req, res) {
  try {
    const { discountId } = req.params;
    const success = await discountService.deleteDiscount(discountId);
    if (success) {
      res.json({ message: 'Discount deleted successfully' });
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete discount' });
  }
}

async function updateDiscount(req, res) {
  try {
    const { discountId } = req.params;
    const updateData = req.body;
    const success = await discountService.updateDiscount(discountId, updateData);
    if (success) {
      res.json({ message: 'Discount updated successfully' });
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update discount' });
  }
}

const getAllPlansDataa = async (req, res) => {
    console.log("dataaaaaaaaaaaaaaaa------1")
    try {
        console.log("dataaaaaaaaaaaaaaaa------2")
      const plans = await discountService.getAllPlansDataa();
      console.log("dataaaaaaaaaaaaaaaa------3")
      console.log("these all are the Plans Data------------------" , plans)
      res.json(plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'An error occurred while fetching plans' });
    }
  };

 async function getAllDiscounts (req, res) {
    try {
      const discounts = await discountService.getAllDiscounts();
      res.json(discounts);
    } catch (error) {
      console.error('Error fetching all discounts:', error);
      res.status(500).json({ error: 'Failed to fetch all discounts' });
    }
  }

  async function getAllUsedDiscounts (req, res) {
    try {
      const discountsData = await discountService.getAllUsedDiscounts();
      res.json(discountsData);
    } catch (error) {
      console.error('Error fetching all discounts:', error);
      res.status(500).json({ error: 'Failed to fetch all discounts' });
    }
  }

module.exports = {
    getDiscountById,
  createDiscount,
  getDiscount,
  useDiscount,
  checkDiscount,
  deleteDiscount,
  updateDiscount,
  getAllPlansDataa,
  getAllDiscounts,
  getAllUsedDiscounts
};