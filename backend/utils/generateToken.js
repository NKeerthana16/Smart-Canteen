const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'smart_canteen_jwt_secret_key_2026', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
