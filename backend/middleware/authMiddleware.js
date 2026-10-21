const { requireAuth } = require('./auth');

module.exports = { protect: requireAuth };
