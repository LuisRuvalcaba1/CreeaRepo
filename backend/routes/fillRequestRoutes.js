// routes/fillRequestRoutes.js

const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/save', authMiddleware.verifyRole('asesor'), formController.saveTemporaryData);
router.post('/complete', authMiddleware.verifyRole('asesor'), formController.completeRequest);

module.exports = router;
