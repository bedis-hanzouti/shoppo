const jwt = require('jsonwebtoken');



const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const secret = process.env.secret;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token found' });
  }

  const token = authHeader.substring('Bearer '.length);

  if (!token) {
    return res.status(401).json({ error: 'No token found' });
  }
  console.log(token);
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    console.log(req.user);

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};


module.exports = authMiddleware;