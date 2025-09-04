const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware.js');
const Listing = require('../models/listing');
const Review = require('../models/review');
const User = require('../models/user');

// Admin dashboard
router.get('/dashboard', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const [listings, reviews, users] = await Promise.all([
      Listing.find({}).populate('owner'),
      Review.find({}).populate('author'),
      User.find({})
    ]);
    res.render('admin/dashboard.ejs', { listings, reviews, users });
  } catch (err) {
    next(err);
  }
});

// Claim single legacy listing (no owner)
router.post('/listings/:id/claim', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash('error', 'Listing not found');
    } else if (listing.owner) {
      req.flash('error', 'Listing already has an owner');
    } else {
      listing.owner = req.user._id;
      await listing.save();
      req.flash('success', 'Listing claimed');
    }
    res.redirect('/admin/dashboard');
  } catch (err) { next(err); }
});

// Bulk claim all legacy listings
router.post('/listings/claim-all', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const result = await Listing.updateMany({ owner: { $exists: false } }, { $set: { owner: req.user._id } });
    req.flash('success', `Claimed ${result.modifiedCount} legacy listings.`);
    res.redirect('/admin/dashboard');
  } catch (err) { next(err); }
});

// Delete any listing
router.delete('/listings/:id', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash('success', 'Listing deleted');
    res.redirect('/admin/dashboard');
  } catch (err) { next(err); }
});

// Delete any review
router.delete('/reviews/:id', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    req.flash('success', 'Review deleted');
    res.redirect('/admin/dashboard');
  } catch (err) { next(err); }
});

module.exports = router;
