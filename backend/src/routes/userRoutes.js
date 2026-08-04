const express = require('express');
const {
  addAddress,
  removeAddress,
  toggleWishlist,
  getWishlist,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/addresses', addAddress);
router.delete('/addresses/:addressId', removeAddress);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

module.exports = router;
