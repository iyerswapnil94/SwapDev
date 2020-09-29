const express = require('express');
const { Router } = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @route GET api/auth
// @access public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error')
  }
});

// @route POST api/auth
// @desc Authenticate user and get token
// @access public
router.post('/', [
  check('email', 'Please add valid email').isEmail(),
  check('password', 'Password requrired').exists(),
], async (req, res) => {
  const errors = validationResult(req);

  // Request Validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body;

  try {
    // Check if user does not exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        errors: [{
          msg: 'Invalid credentials'
        }]
      })
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        errors: [{
          msg: 'Invalid credentials'
        }]
      })
    }

    // Return JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) {
          throw err;
        }
        res.json({ token });
      });
    // return res.send('User Registered');

  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;