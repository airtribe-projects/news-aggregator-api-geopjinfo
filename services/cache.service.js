const NodeCache = require('node-cache');
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 900, // default: 15 min
  checkperiod: 120, // check expired keys every 2 minutes
});

module.exports = cache;
