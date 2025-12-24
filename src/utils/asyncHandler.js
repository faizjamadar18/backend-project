// In Express (Node.js), when you use async/await in routes and an error happens,
// Express does NOT automatically catch that error.
// So your server can crash or hang 😵.
// 👉 This asyncHandler is a helper that automatically catches errors from async functions and sends them to Express error middleware.
// So you don’t need try-catch again and again


const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err)) // Convert async function into Promise, if error occur move to next middleware 
    }
}


export { asyncHandler }