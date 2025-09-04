function wrapAsync(fn) {
    return function (req, res, next) {
        // Ensure both sync and async handlers are handled and avoid calling `.catch` on undefined
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
module.exports = wrapAsync;