const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pin = require('../models/Pin');

const pinController = require('../controllers/pinController');


router.post('/create', pinController.postCreate);

router.get('/pin-image/:pin', pinController.getPinImage);
module.exports = router;