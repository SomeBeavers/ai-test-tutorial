const productModel = require('../models/productModel');

const VALID_PAYMENT_METHODS = ['cash', 'credit_card'];
const CASH_DISCOUNT_RATE = 0.1;

function checkout({ items, paymentMethod }) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Items array is required and must not be empty.');
    error.status = 400;
    throw error;
  }

  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    const error = new Error('Payment method must be "cash" or "credit_card".');
    error.status = 400;
    throw error;
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productModel.findById(item.productId);

    if (!product) {
      const error = new Error(`Product with id ${item.productId} not found.`);
      error.status = 404;
      throw error;
    }

    if (!item.quantity || item.quantity < 1) {
      const error = new Error(`Invalid quantity for product ${product.name}.`);
      error.status = 400;
      throw error;
    }

    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}.`);
      error.status = 400;
      throw error;
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      lineTotal: parseFloat(lineTotal.toFixed(2)),
    });
  }

  const discount =
    paymentMethod === 'cash' ? parseFloat((subtotal * CASH_DISCOUNT_RATE).toFixed(2)) : 0;
  const total = parseFloat((subtotal - discount).toFixed(2));

  for (const item of items) {
    productModel.updateStock(item.productId, item.quantity);
  }

  return {
    items: orderItems,
    paymentMethod,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount,
    discountRate: paymentMethod === 'cash' ? CASH_DISCOUNT_RATE : 0,
    total,
  };
}

module.exports = { checkout };
