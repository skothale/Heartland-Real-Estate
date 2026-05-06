const express = require('express');

const requireAuth = require('../middleware/requireAuth');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(requireAuth);

router.patch('/me', userController.updateMe);
router.post('/me/password', userController.changeMyPassword);

module.exports = router;

