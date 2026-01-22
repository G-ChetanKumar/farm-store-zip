const express = require('express');
const router = express.Router();
const entrepreneurController = require('../controllers/EntrepreneurController');
const adminAuth = require('../middlewares/AdminAuth');

// Public route for entrepreneur application submission
router.post('/apply', entrepreneurController.applyEntrepreneur);

// Admin-only routes
router.post('/add-entrepreneur', adminAuth, entrepreneurController.createEntrepreneur);
router.get('/get-entrepreneurs', adminAuth, entrepreneurController.getEntrepreneurs);
router.get('/pending', adminAuth, entrepreneurController.getPendingEntrepreneurs);
router.get('/approved', adminAuth, entrepreneurController.getApprovedEntrepreneurs);
router.get('/rejected', adminAuth, entrepreneurController.getRejectedEntrepreneurs);
router.get('/:id', adminAuth, entrepreneurController.getEntrepreneurById);
router.put('/update-entrepreneur/:id', adminAuth, entrepreneurController.updateEntrepreneur);
router.patch('/:id/approve', adminAuth, entrepreneurController.approveEntrepreneur);
router.patch('/:id/reject', adminAuth, entrepreneurController.rejectEntrepreneur);
router.delete('/:id', adminAuth, entrepreneurController.deleteEntrepreneur);

// Entrepreneur login
router.post('/login', entrepreneurController.loginEntrepreneur);

module.exports = router;
