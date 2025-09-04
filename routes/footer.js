const express = require('express');
const router = express.Router();

// Support Routes
router.get('/help', (req, res) => {
    res.render('footer-pages/help', { 
        title: 'Help Center - WanderLust',
        currentUser: req.user
    });
});

router.get('/safety', (req, res) => {
    res.render('footer-pages/safety', { 
        title: 'Safety Information - WanderLust',
        currentUser: req.user
    });
});

router.get('/cancellation', (req, res) => {
    res.render('footer-pages/cancellation', { 
        title: 'Cancellation Options - WanderLust',
        currentUser: req.user
    });
});

router.get('/report', (req, res) => {
    res.render('footer-pages/report', { 
        title: 'Report a Concern - WanderLust',
        currentUser: req.user
    });
});

router.get('/disability', (req, res) => {
    res.render('footer-pages/disability', { 
        title: 'Disability Support - WanderLust',
        currentUser: req.user
    });
});

// Community Routes
router.get('/disaster-relief', (req, res) => {
    res.render('footer-pages/disaster-relief', { 
        title: 'Disaster Relief Housing - WanderLust',
        currentUser: req.user
    });
});

router.get('/support-afghan', (req, res) => {
    res.render('footer-pages/support-afghan', { 
        title: 'Support Afghan Refugees - WanderLust',
        currentUser: req.user
    });
});

router.get('/combat-discrimination', (req, res) => {
    res.render('footer-pages/combat-discrimination', { 
        title: 'Combating Discrimination - WanderLust',
        currentUser: req.user
    });
});

router.get('/diversity', (req, res) => {
    res.render('footer-pages/diversity', { 
        title: 'Diversity & Belonging - WanderLust',
        currentUser: req.user
    });
});

router.get('/accessibility', (req, res) => {
    res.render('footer-pages/accessibility', { 
        title: 'Accessibility - WanderLust',
        currentUser: req.user
    });
});

// Hosting Routes
router.get('/host', (req, res) => {
    res.render('footer-pages/host', { 
        title: 'Try Hosting - WanderLust',
        currentUser: req.user
    });
});

router.get('/aircover', (req, res) => {
    res.render('footer-pages/aircover', { 
        title: 'AirCover for Hosts - WanderLust',
        currentUser: req.user
    });
});

router.get('/host-resources', (req, res) => {
    res.render('footer-pages/host-resources', { 
        title: 'Hosting Resources - WanderLust',
        currentUser: req.user
    });
});

router.get('/community-forum', (req, res) => {
    res.render('footer-pages/community-forum', { 
        title: 'Community Forum - WanderLust',
        currentUser: req.user
    });
});

router.get('/responsible-hosting', (req, res) => {
    res.render('footer-pages/responsible-hosting', { 
        title: 'Responsible Hosting - WanderLust',
        currentUser: req.user
    });
});

// WanderLust Routes
router.get('/newsroom', (req, res) => {
    res.render('footer-pages/newsroom', { 
        title: 'Newsroom - WanderLust',
        currentUser: req.user
    });
});

router.get('/features', (req, res) => {
    res.render('footer-pages/features', { 
        title: 'New Features - WanderLust',
        currentUser: req.user
    });
});

router.get('/careers', (req, res) => {
    res.render('footer-pages/careers', { 
        title: 'Careers - WanderLust',
        currentUser: req.user
    });
});

router.get('/investors', (req, res) => {
    res.render('footer-pages/investors', { 
        title: 'Investors - WanderLust',
        currentUser: req.user
    });
});

router.get('/emergency', (req, res) => {
    res.render('footer-pages/emergency', { 
        title: 'Emergency Stays - WanderLust',
        currentUser: req.user
    });
});

// Legal Routes
router.get('/privacy', (req, res) => {
    res.render('footer-pages/privacy', { 
        title: 'Privacy Policy - WanderLust',
        currentUser: req.user
    });
});

router.get('/terms', (req, res) => {
    res.render('footer-pages/terms', { 
        title: 'Terms of Service - WanderLust',
        currentUser: req.user
    });
});

router.get('/sitemap', (req, res) => {
    res.render('footer-pages/sitemap', { 
        title: 'Sitemap - WanderLust',
        currentUser: req.user
    });
});

router.get('/company', (req, res) => {
    res.render('footer-pages/company', { 
        title: 'Company Details - WanderLust',
        currentUser: req.user
    });
});

module.exports = router;
