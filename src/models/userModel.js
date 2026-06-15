const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    password: bcrypt.hashSync('password123', 10),
  },
  {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
    password: bcrypt.hashSync('password456', 10),
  },
  {
    id: 3,
    username: 'carol',
    email: 'carol@example.com',
    password: bcrypt.hashSync('password789', 10),
  },
];

let nextUserId = 4;

function findAll() {
  return users.map(({ password, ...user }) => user);
}

function findById(id) {
  return users.find((user) => user.id === id);
}

function findByUsername(username) {
  return users.find((user) => user.username === username);
}

function findByEmail(email) {
  return users.find((user) => user.email === email);
}

function create({ username, email, password }) {
  const user = {
    id: nextUserId++,
    username,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  users.push(user);
  const { password: _, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  findAll,
  findById,
  findByUsername,
  findByEmail,
  create,
};
