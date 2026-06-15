const products = [
  {
    id: 1,
    name: 'Laptop',
    description: '15-inch ultrabook with 16GB RAM',
    price: 999.99,
    stock: 10,
  },
  {
    id: 2,
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones',
    price: 149.99,
    stock: 25,
  },
  {
    id: 3,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with USB receiver',
    price: 29.99,
    stock: 50,
  },
];

function findAll() {
  return products;
}

function findById(id) {
  return products.find((product) => product.id === id);
}

function updateStock(id, quantity) {
  const product = findById(id);
  if (!product) {
    return null;
  }
  product.stock -= quantity;
  return product;
}

module.exports = {
  findAll,
  findById,
  updateStock,
};
