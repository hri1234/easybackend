const db = require('../../config/database');
const moment = require('moment');

// Create a new discount
async function createDiscount(discountData) {
    const { 
      discount_code, 
      frequency, 
      start_date, 
      end_date, 
      discount_type, 
      discountPlanType,
      discountApplyType,
      discountApplyValue,    
    } = discountData;
  
    const formattedStartDate = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
    const formattedEndDate = moment(end_date).format('YYYY-MM-DD HH:mm:ss'); 
    
    const [result] = await db.execute(
      'INSERT INTO discount (discount_code, frequency, start_date, end_date, discount_type, discountPlanType, discountApplyType, discountApplyValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        discount_code,
        frequency === '' || frequency === 'unlimited' ? null : frequency,
        formattedStartDate,
        formattedEndDate,
        discount_type.toUpperCase(),
        discountPlanType.toUpperCase(),
        discountApplyType.toUpperCase(),
        discountApplyValue
      ]
    );
    return result.insertId;
}

// Get discount by code
async function getDiscountByCode(code) {
    console.log("Getting discount for code:", code);
    try {
      const [rows] = await db.execute(
        'SELECT * FROM discount WHERE discount_code = ? AND is_deleted = FALSE', 
        [code]
      );
      console.log("Discount query result:", rows);
      return rows[0];
    } catch (error) {
      console.error("Error in getDiscountByCode:", error);
      throw error;
    }
}

// Get discount by ID
async function getDiscountById(id) {
    console.log("Getting discount for ID:", id);
    try {
      const [rows] = await db.execute(
        'SELECT * FROM discount WHERE id = ? AND is_deleted = FALSE', 
        [id]
      );
      console.log("Discount query result:", rows);
      return rows[0];
    } catch (error) {
      console.error("Error in getDiscountById:", error);
      throw error;
    }
}

// Get all active discounts
async function getAllDiscounts() {
    try {
      const [rows] = await db.execute('SELECT * FROM discount WHERE is_deleted = FALSE');
      return rows;
    } catch (error) {
      console.error("Error in getAllDiscounts:", error);
      throw error;
    }
}

// Use a discount
async function useDiscount(discountId, shopifyDomain) {
    console.log("Using discount:", discountId, "for domain:", shopifyDomain);
    try {
      const [discountRows] = await db.execute(
        'SELECT discount_code FROM discount WHERE id = ?',
        [discountId]
      );
  
      if (discountRows.length === 0) {
        throw new Error(`No discount found with id: ${discountId}`);
      }
  
      const discountCode = discountRows[0].discount_code;
  
      const [result] = await db.execute(
        'INSERT INTO used_discount (discount_id, shopify_domain, discount_code) VALUES (?, ?, ?)',
        [discountId, shopifyDomain, discountCode]
      );
  
      return {
        insertId: result.insertId,
        discountCode: discountCode
      };
    } catch (error) {
      console.error("Error in useDiscount service:", error);
      throw error;
    }
}

// Check discount usage count
async function checkDiscountUsage(discountId, shopifyDomain) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM used_discount WHERE discount_id = ? AND shopify_domain = ? AND is_deleted = FALSE',
      [discountId, shopifyDomain]
    );
    return rows[0].count;
}

// Main function to validate and check discount
async function checkDiscount(discountCode, shopifyDomain) {
    console.log("Checking discount for code:", discountCode, "and domain:", shopifyDomain);
    try {
      const [rows] = await db.execute(
        'SELECT * FROM discount WHERE discount_code = ? AND is_deleted = FALSE', 
        [discountCode]
      );
      console.log("Query result:", rows);
      
      const discount = rows[0];
  
      if (!discount) {
        console.log("Discount not found");
        return { valid: false, message: 'Discount code not found' };
      }
  
      const currentDate = new Date();

      // Check if discount period has started
      if (new Date(discount.start_date) > currentDate) {
        console.log("Discount not yet active");
        return { valid: false, message: 'Discount Code has not been Issued Yet' };
      }
      
      // Check if discount has expired
      if (new Date(discount.end_date) < currentDate) {
        console.log("Discount expired");
        return { valid: false, message: 'Discount code has expired' };
      }
  
      // Check frequency limits
      if (discount.frequency !== null) {
        const [usageRows] = await db.execute(
          'SELECT COUNT(*) as count FROM used_discount WHERE discount_id = ? AND is_deleted = FALSE',
          [discount.id]
        );
        const usageCount = usageRows[0].count;
  
        console.log("Usage count:", usageCount, "Frequency:", discount.frequency);
        if (usageCount >= discount.frequency) {
          return { valid: false, message: 'Discount usage limit exceeded' };
        }
      }
  
      // Check if user has already used this discount
      const [userUsageRows] = await db.execute(
        'SELECT COUNT(*) as count FROM used_discount WHERE discount_id = ? AND shopify_domain = ? AND is_deleted = FALSE',
        [discount.id, shopifyDomain]
      );
      const userUsageCount = userUsageRows[0].count;
  
      console.log("User usage count:", userUsageCount);
      if (userUsageCount > 0) {
        return { valid: false, message: 'You have already used this discount code' };
      }
  
      return {
        valid: true,
        message: "Successfully Fetched!",
        discount: {
          id: discount.id,
          code: discount.discount_code,
          type: discount.discount_type,
          frequency: discount.frequency,
          start_date: discount.start_date,
          end_date: discount.end_date,
          discountPlanType: discount.discountPlanType,
          discountApplyType: discount.discountApplyType,
          discountApplyValue: discount.discountApplyValue,
          is_deleted: discount.is_deleted
        }
      };
    } catch (error) {
      console.error("Error in checkDiscount:", error);
      throw error;
    }
}

// Delete a discount (soft delete)
async function deleteDiscount(discountId) {
    const [result] = await db.execute(
      'UPDATE discount SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [discountId]
    );
    return result.affectedRows > 0;
}

// Update a discount
async function updateDiscount(discountId, updateData) {
    console.log('Updating discount:', discountId, updateData);
    
    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updateData)) {
        if (key === 'discountApplyValue') {
            updateFields.push(`${key} = ?`);
            updateValues.push(JSON.stringify(value));
        } else if (key === 'start_date' || key === 'end_date') {
            updateFields.push(`${key} = ?`);
            updateValues.push(moment(value).format('YYYY-MM-DD HH:mm:ss'));
        } else {
            updateFields.push(`${key} = ?`);
            updateValues.push(value);
        }
    }

    updateValues.push(discountId);

    const query = `UPDATE discount SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log('Update query:', query);
    console.log('Update values:', updateValues);

    try {
        const [result] = await db.execute(query, updateValues);
        console.log('Update result:', result);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error in updateDiscount:', error);
        throw error;
    }
}

// Get all plans data
async function getAllPlansData() {
    const connection = await db.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM admin_esa_plans');
      return rows;
    } finally {
      await connection.release();
    }
}

// Get all used discounts
async function getAllUsedDiscounts() {
    try {
      const [result] = await db.execute('SELECT * FROM used_discount WHERE is_deleted = FALSE');
      return result;
    } catch (error) {
      console.error("Error in getAllUsedDiscounts:", error);
      throw error;
    }
}

module.exports = {
    createDiscount,
    getDiscountByCode,
    useDiscount,
    checkDiscountUsage,
    checkDiscount,
    deleteDiscount,
    updateDiscount,
    getAllPlansData,
    getAllDiscounts,
    getDiscountById,
    getAllUsedDiscounts
};