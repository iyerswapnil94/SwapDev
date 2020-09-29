const express = require('express');
const { Router } = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
// @route GET api/profile/me
// @desc Get current user profile
// @access Private (with token)
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(404).json({ msg: 'No Profile' });
    }
    res.json({ profile });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;