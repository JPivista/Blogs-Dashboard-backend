const Lead = require('../models/Lead');

exports.createLead = async (req, res) => {
    try {
        const { name, phone_number, category } = req.body;
        const lead = new Lead({ name, phone_number, category });
        await lead.save();
        res.status(201).json(lead);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getLeads = async (req, res) => {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
};

exports.getLeadById = async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
};

exports.deleteLead = async (req, res) => {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
}; 
