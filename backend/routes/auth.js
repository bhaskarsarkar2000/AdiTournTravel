const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  sendOTPForCheckout, 
  verifyOTPAndLogin, 
  resendOTP,
  sendPhoneOTP,
  verifyPhoneOTP,
  resendPhoneOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTPForCheckout);
router.post('/verify-otp', verifyOTPAndLogin);
router.post('/resend-otp', resendOTP);
router.post('/send-phone-otp', sendPhoneOTP);
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/resend-phone-otp', resendPhoneOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
