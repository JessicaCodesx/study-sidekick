// backend/controllers/userController.js
const User = require('../models/User');
const admin = require('../config/firebase');

// Get or create user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get user from MongoDB by Firebase UID
    let user = await User.findOne({ firebaseId: req.user.id });
    
    // If user doesn't exist in MongoDB, create one based on Firebase data
    if (!user) {
      // Get user data from Firebase
      const firebaseUser = await admin.auth().getUser(req.user.id);
      
      user = new User({
        firebaseId: req.user.id,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Student',
        avatar: firebaseUser.photoURL,
        theme: 'system',
        studyStreak: 0
      });
      
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { displayName, avatar, theme, studyStreak, lastStudyDate } = req.body;

    // Find user by Firebase UID
    const user = await User.findOne({ firebaseId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (displayName) user.displayName = displayName;
    if (avatar) user.avatar = avatar;
    if (theme) user.theme = theme;
    if (studyStreak !== undefined) user.studyStreak = studyStreak;
    if (lastStudyDate) user.lastStudyDate = lastStudyDate;
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};