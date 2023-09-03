const expressJwt = require('express-jwt');

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    const user = req.user.user;
    const login = user.login;

    console.log(login);
    if (user && login === 'true') {

        next();
    } else {

        return res.status(403).json({ error: 'Forbidden Only Admin ' });
    }
};

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;

    // Create the expressJwt middleware
    const middleware = expressJwt({
        secret,
        algorithms: ['HS256'],
    }).unless({
        path: [

            { url: new RegExp(`${api}/products(.*)`), methods: ['GET', 'OPTIONS'] },
            { url: new RegExp(`${api}/category(.*)`), methods: ['GET', 'OPTIONS'] },
            { url: new RegExp(`${api}/orders(.*)`), methods: ['GET', 'OPTIONS'] },
            `${api}/customer/login`,
            `${api}/customer/register`,
            `${api}/user/login`,
            `${api}/user/register`,
        ],
    });

    // Custom error handling for expressJwt
    const customErrorHandler = (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            // Handle unauthorized error (e.g., send a custom error response)
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired' });
        }
        // Handle other errors here
        return next(err);
    };

    // Combine the expressJwt middleware, custom error handler, and isAdmin middleware
    return [middleware, customErrorHandler];
}

module.exports = { authJwt, isAdmin };
