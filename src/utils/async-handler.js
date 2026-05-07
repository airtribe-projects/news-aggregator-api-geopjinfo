/**
 * Wraps an async route handler and forwards any thrown errors to Express next().
 * Eliminates the need for try/catch blocks in every controller.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
