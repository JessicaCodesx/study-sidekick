// backend/middleware/auth.js
const admin = require('../config/firebase');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = { id: decodedToken.uid, email: decodedToken.email };
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = auth;