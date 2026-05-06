const express = require('express');

const agentController = require('../controllers/agentController');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/', agentController.listAgents);
router.post('/', agentController.createAgent);

module.exports = router;
