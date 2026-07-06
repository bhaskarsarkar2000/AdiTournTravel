const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Ethereal Email (Free service, no credentials needed)
const sendOTP = async (email, otp) => {
  try {
    // Create test account if needed
    let testAccount = await nodemailer.createTestAccount();
    
    // Create transporter using Ethereal (free email testing service)
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: '"Tour & Travel 🚌" <noreply@tourandtravel.com>',
      to: email,
      subject: 'Your OTP for Travel & Tour Login',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 500px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { padding: 30px; text-align: center; }
              .otp-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0284c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; color: #0284c7; letter-spacing: 5px; }
              .timer { color: #ef4444; font-weight: bold; }
              .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚌 Tour & Travel</h1>
                <p>Your Trusted Travel Partner</p>
              </div>
              <div class="content">
                <h2>Verify Your Email</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p>This OTP is valid for <span class="timer">10 minutes</span></p>
                <p style="color: #666; font-size: 14px;">Do not share this OTP with anyone. We will never ask for your OTP.</p>
              </div>
              <div class="footer">
                <p>If you didn't request this OTP, please ignore this email.</p>
                <p>&copy; 2024 Tour & Travel. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    console.log('OTP Email sent. Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

module.exports = { generateOTP, sendOTP };
