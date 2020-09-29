const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route GET api/users
// @access public
router.get('/', (req, res) => res.send('User Routes'));

// @route POST api/users
// @access public
router.post('/', [
  check('name', 'Name required').not().isEmpty(),
  check('email', 'Please add valid email').isEmail(),
  check('password', 'Please enter 6 or more characters').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);

  // Request Validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        errors: [{
          msg: 'User already exists'
        }]
      })
    }

    // Get Gravatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm',
    });

    user = new User({
      name,
      email,
      avatar,
      password,
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to DB
    await user.save();

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