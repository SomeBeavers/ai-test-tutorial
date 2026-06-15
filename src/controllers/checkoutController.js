const checkoutService = require('../services/checkoutService');

function checkout(req, res, next) {
  try {
    const order = checkoutService.checkout(req.body);
    res.status(200).json({
      message: 'Checkout completed successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { checkout };
