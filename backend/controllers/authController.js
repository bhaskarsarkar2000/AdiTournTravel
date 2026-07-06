const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, sendOTP } = require('../utils/otp');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, licenseNumber, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0) {
        return res.status(403).json({ success: false, message: 'Admin registration is restricted' });
      }
    }

    const userData = { name, email, phone, password, role };
    if (role === 'driver' && licenseNumber) userData.licenseNumber = licenseNumber;
    if (role === 'traveller' && address) userData.address = address;

    const user = await User.create(userData);
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password and role are required' });
    }

    const user = await User.findOne({ email, role }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
    }

    user.password = undefined;
    const token = signToken(user._id);
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send OTP to traveller's email for checkout login
exports.sendOTPForCheckout = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user exists or create new one
    let user = await User.findOne({ email, role: 'traveller' });
    if (!user) {
      // For new travellers, just create user for OTP verification
      user = await User.create({
        email,
        role: 'traveller',
        isVerified: false
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({ success: true, message: 'OTP sent to your email', userId: user._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP and login traveller
exports.verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email, role: 'traveller' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check OTP validity
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    // Clear OTP and mark as verified
    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = signToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email, role: 'traveller' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendOTP(email, otp);

    res.json({ success: true, message: 'OTP resent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send OTP to phone for checkout login
exports.sendPhoneOTP = async (req, res) => {
  try {
    const { phone, email, name } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Validate phone number format (10 digits for India)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number. Please enter 10-digit Indian number.' });
    }

    // Check if user exists or create new one
    let user = await User.findOne({ phone, role: 'traveller' });
    if (!user) {
      // For new travellers, create user for OTP verification
      user = await User.create({
        email: email || `guest-${Date.now()}@tourtravel.local`,
        phone,
        name: name || 'Guest User',
        role: 'traveller',
        isVerified: false
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via phone (using mock for testing - can integrate real SMS API)
    try {
      await sendPhoneOTPMessage(phone, otp);
    } catch (phoneError) {
      console.error('Phone OTP send error:', phoneError);
      // For testing: log OTP to console
      console.log(`TEST MODE: OTP for ${phone} is ${otp}`);
    }

    res.json({ success: true, message: `OTP sent to +91${phone}`, userId: user._id, phone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP from phone and login traveller
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const user = await User.findOne({ phone, role: 'traveller' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check OTP validity
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    // Clear OTP and mark as verified
    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = signToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend OTP to phone
exports.resendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }

    const user = await User.findOne({ phone, role: 'traveller' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via phone
    try {
      await sendPhoneOTPMessage(phone, otp);
    } catch (phoneError) {
      console.error('Phone OTP send error:', phoneError);
      // For testing: log OTP to console
      console.log(`TEST MODE: OTP for ${phone} is ${otp}`);
    }

    res.json({ success: true, message: `OTP resent to +91${phone}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to send SMS OTP via Fast2SMS (Free tier available)
const sendPhoneOTPMessage = async (phone, otp) => {
  try {
    const axios = require('axios');
    const https = require('https');
    
    // Using Fast2SMS - Free SMS API for India
    // Sign up: https://www.fast2sms.com
    // Get API key from Dashboard -> API
    // Free tier: ~100 SMS per day
    
    if (!process.env.FAST2SMS_API_KEY) {
      console.log(`\n⚠️  DEMO MODE: OTP for +91${phone} is: ${otp}`);
      console.log(`Configure FAST2SMS_API_KEY in .env to send real SMS\n`);
      return true;
    }

    const message = `Your Tour & Travel OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
    
    // Create HTTPS agent with SSL verification disabled (for development)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    
    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        route: 'otp',
        variables_values: otp,
        flash: 0,
        numbers: phone
      },
      headers: {
        'cache-control': 'no-cache'
      },
      httpsAgent: httpsAgent
    });

    if (response.data.return === true) {
      console.log(`\n✅ SMS SENT SUCCESSFULLY`);
      console.log(`To: +91${phone}`);
      console.log(`Message: ${message}\n`);
      return true;
    } else {
      console.log(`\n❌ SMS Send Failed: ${response.data.message}`);
      console.log(`Demo OTP: ${otp}\n`);
      return true; // Continue anyway for testing
    }
  } catch (error) {
    console.error(`\n⚠️  Failed to send via Fast2SMS`);
    console.error(`Status: ${error.response?.status}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Response Data:`, error.response?.data);
    console.error(`\nPossible causes:`);
    console.error(`- API Key is invalid or expired`);
    console.error(`- API Key has no SMS quota left`);
    console.error(`- Request format error`);
    console.error(`\nUsing DEMO mode - Check console for OTP\n`);
    return true; // Continue with demo mode
  }
};
