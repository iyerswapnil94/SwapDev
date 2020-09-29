const express = require('express');
const { Router } = require('express');
const router = express.Router();

// @route GET api/post
// @access public
router.get('/', (req, res) => res.send('Post Routes'));

module.exports = router;