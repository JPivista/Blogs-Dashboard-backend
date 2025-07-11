const express = require('express');
const router = express.Router();
const { createLead, getLeads, getLeadById, deleteLead } = require('../controllers/leadController');

router.post('/', createLead);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.delete('/:id', deleteLead);

module.exports = router; 