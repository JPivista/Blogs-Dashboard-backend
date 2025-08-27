const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Test SEO metadata route without middleware
app.get('/api/seo-metadata/test', (req, res) => {
    res.json({ message: 'SEO metadata route is working!' });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Test the basic route: http://localhost:5001/test');
    console.log('Test the SEO route: http://localhost:5001/api/seo-metadata/test');
});
