/**
 * Wraps an async function to catch any errors and pass them to Express's error handling middleware
 * @param {Function} fn - The async function to wrap
 * @returns {Function} A new function that handles errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Resolve the promise returned by the controller
    // If it rejects, the error will be caught by Express's error handling middleware
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
