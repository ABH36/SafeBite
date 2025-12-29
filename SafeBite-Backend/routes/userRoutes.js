const express = require('express');
const router = express.Router();
const { getUserProfile, updateHealthProfile, logConsumption } = require('../controllers/userController');

router.get('/:deviceId', getUserProfile);
router.put('/update', updateHealthProfile);
router.post('/log', logConsumption); // 👈 NEW ROUTE

module.exports = router;