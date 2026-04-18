const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  // true for 465, false for other ports; allow override via env
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // In development behind corporate proxies or local SMTP with self-signed certs,
  // allow opting out of TLS verification via env. Default remains secure (true).
  tls: {
    rejectUnauthorized: String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true') === 'true'
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create beautiful HTML email template
const createOTPEmailTemplate = (otp, userName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - CampusAI</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #ffffff;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #1a1a1a;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .header {
                background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }
            
            .logo {
                font-size: 2.5rem;
                font-weight: bold;
                color: #000000;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }
            
            .title {
                font-size: 1.5rem;
                font-weight: bold;
                color: #000000;
                margin-bottom: 5px;
                position: relative;
                z-index: 1;
            }
            
            .subtitle {
                font-size: 1rem;
                color: #000000;
                opacity: 0.8;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 40px 30px;
                background: #1a1a1a;
            }
            
            .greeting {
                font-size: 1.2rem;
                margin-bottom: 20px;
                color: #fbbf24;
            }
            
            .message {
                font-size: 1rem;
                margin-bottom: 30px;
                color: #e5e7eb;
                line-height: 1.8;
            }
            
            .otp-container {
                background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
                border: 2px solid #fbbf24;
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
                position: relative;
                overflow: hidden;
            }
            
            .otp-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 30%, rgba(251, 191, 36, 0.1) 50%, transparent 70%);
                animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .otp-label {
                font-size: 1rem;
                color: #fbbf24;
                margin-bottom: 15px;
                font-weight: 600;
            }
            
            .otp-code {
                font-size: 3rem;
                font-weight: bold;
                color: #ffffff;
                letter-spacing: 8px;
                text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
                position: relative;
                z-index: 1;
            }
            
            .otp-expiry {
                font-size: 0.9rem;
                color: #9ca3af;
                margin-top: 15px;
                position: relative;
                z-index: 1;
            }
            
            .instructions {
                background: rgba(251, 191, 36, 0.1);
                border-left: 4px solid #fbbf24;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 10px 10px 0;
            }
            
            .instructions h3 {
                color: #fbbf24;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            
            .instructions ul {
                list-style: none;
                padding-left: 0;
            }
            
            .instructions li {
                margin-bottom: 8px;
                color: #e5e7eb;
                position: relative;
                padding-left: 20px;
            }
            
            .instructions li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #fbbf24;
                font-weight: bold;
            }
            
            .footer {
                background: #111827;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #374151;
            }
            
            .footer-text {
                color: #9ca3af;
                font-size: 0.9rem;
                margin-bottom: 15px;
            }
            
            .social-links {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 20px;
            }
            
            .social-link {
                color: #fbbf24;
                text-decoration: none;
                font-weight: 600;
                transition: color 0.3s ease;
            }
            
            .social-link:hover {
                color: #f97316;
            }
            
            .warning {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
                color: #fca5a5;
                font-size: 0.9rem;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .header, .content, .footer {
                    padding: 20px;
                }
                
                .otp-code {
                    font-size: 2.5rem;
                    letter-spacing: 6px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">C</div>
                <div class="title">CampusAI</div>
                <div class="subtitle">Email Verification</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${userName}! 👋</div>
                
                <div class="message">
                    Welcome to CampusAI! We're excited to have you join our community of students. 
                    To complete your registration and start exploring colleges with AI assistance, 
                    please verify your email address using the OTP below.
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="otp-expiry">This code expires in 10 minutes</div>
                </div>
                
                <div class="instructions">
                    <h3>📋 How to verify your email:</h3>
                    <ul>
                        <li>Copy the 6-digit code above</li>
                        <li>Return to the CampusAI registration page</li>
                        <li>Enter the code in the verification field</li>
                        <li>Click "Verify Email" to complete registration</li>
                    </ul>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. 
                    CampusAI will never ask for your verification code via phone or email.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    If you didn't create an account with CampusAI, please ignore this email.
                </div>
                <div class="footer-text">
                    © 2025 CampusAI. All rights reserved. Made with ❤️ for students.
                </div>
                <div class="social-links">
                    <a href="#" class="social-link">Privacy Policy</a>
                    <a href="#" class="social-link">Terms of Service</a>
                    <a href="#" class="social-link">Support</a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const mailOptions = {
      from: `"CampusAI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎓 Verify Your CampusAI Account - Complete Registration',
      html: createOTPEmailTemplate(otp, userName),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};

// Create college approval email template
const createCollegeApprovalEmailTemplate = (collegeName, contactPerson, email, password) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>College Approval - CampusAI</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #ffffff;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #1a1a1a;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }
            
            .logo {
                font-size: 2.5rem;
                font-weight: bold;
                color: #000000;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }
            
            .title {
                font-size: 1.5rem;
                font-weight: bold;
                color: #000000;
                margin-bottom: 5px;
                position: relative;
                z-index: 1;
            }
            
            .subtitle {
                font-size: 1rem;
                color: #000000;
                opacity: 0.8;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 40px 30px;
                background: #1a1a1a;
            }
            
            .greeting {
                font-size: 1.2rem;
                margin-bottom: 20px;
                color: #10b981;
            }
            
            .message {
                font-size: 1rem;
                margin-bottom: 30px;
                color: #e5e7eb;
                line-height: 1.8;
            }
            
            .credentials-container {
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                border: 2px solid #10b981;
                border-radius: 20px;
                padding: 40px;
                margin: 30px 0;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
            }
            
            .credentials-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.05) 50%, transparent 70%);
                animation: shimmer 3s infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .credentials-title {
                font-size: 1.4rem;
                color: #10b981;
                margin-bottom: 30px;
                font-weight: 700;
                text-align: center;
                position: relative;
                z-index: 1;
                text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
            }
            
            .credential-item {
                display: flex;
                flex-direction: column;
                margin-bottom: 25px;
                position: relative;
                z-index: 1;
            }
            
            .credential-item:last-child {
                margin-bottom: 0;
            }
            
            .credential-label {
                font-size: 0.9rem;
                color: #9ca3af;
                font-weight: 600;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .credential-value {
                font-size: 1.1rem;
                color: #ffffff;
                font-weight: 700;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
                padding: 15px 20px;
                border-radius: 12px;
                border: 2px solid rgba(16, 185, 129, 0.3);
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
                word-break: break-all;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
                position: relative;
            }
            
            .credential-value::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.1) 50%, transparent 70%);
                border-radius: 10px;
                pointer-events: none;
            }
            
            .instructions {
                background: rgba(16, 185, 129, 0.1);
                border-left: 4px solid #10b981;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 10px 10px 0;
            }
            
            .instructions h3 {
                color: #10b981;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            
            .instructions ul {
                list-style: none;
                padding-left: 0;
            }
            
            .instructions li {
                margin-bottom: 8px;
                color: #e5e7eb;
                position: relative;
                padding-left: 20px;
            }
            
            .instructions li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #10b981;
                font-weight: bold;
            }
            
            .login-button {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: #000000;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.3s ease;
            }
            
            .login-button:hover {
                transform: translateY(-2px);
            }
            
            .footer {
                background: #111827;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #374151;
            }
            
            .footer-text {
                color: #9ca3af;
                font-size: 0.9rem;
                margin-bottom: 15px;
            }
            
            .warning {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin: 20px 0;
                color: #fbbf24;
                font-size: 0.9rem;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .header, .content, .footer {
                    padding: 20px;
                }
                
                .credentials-container {
                    padding: 25px;
                    margin: 20px 0;
                }
                
                .credentials-title {
                    font-size: 1.2rem;
                    margin-bottom: 20px;
                }
                
                .credential-item {
                    margin-bottom: 20px;
                }
                
                .credential-value {
                    padding: 12px 15px;
                    font-size: 1rem;
                }
                
                .login-button {
                    padding: 12px 25px;
                    font-size: 0.9rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎓</div>
                <div class="title">Congratulations!</div>
                <div class="subtitle">Your College Has Been Approved</div>
            </div>
            
            <div class="content">
                <div class="greeting">Dear ${contactPerson},</div>
                
                <div class="message">
                    We are thrilled to inform you that <strong>${collegeName}</strong> has been successfully approved and added to CampusAI! 
                    Your college is now live on our platform and can be discovered by thousands of students looking for the perfect educational match.
                </div>
                
                <div class="credentials-container">
                    <div class="credentials-title">🔐 Your College Admin Login Credentials</div>
                    <div class="credential-item">
                        <div class="credential-label">📧 Email Address</div>
                        <div class="credential-value">${email}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">🔑 Temporary Password</div>
                        <div class="credential-value">${password}</div>
                    </div>
                </div>
                
                <div class="instructions">
                    <h3>🚀 Next Steps:</h3>
                    <ul>
                        <li>Use the credentials above to log into your college admin dashboard</li>
                        <li>Complete your college profile with additional details</li>
                        <li>Add courses, facilities, and other important information</li>
                        <li>Upload photos and documents to showcase your college</li>
                        <li>Start engaging with prospective students</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" class="login-button">
                        🎯 Access Your Dashboard
                    </a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important Security Notice:</strong> Please change your password immediately after your first login. 
                    Keep your login credentials secure and never share them with unauthorized personnel.
                </div>
                
                <div class="message">
                    Welcome to the CampusAI family! We're excited to help you connect with students and showcase what makes your college special. 
                    If you have any questions or need assistance, please don't hesitate to contact our support team.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    This is an automated message from CampusAI. Please do not reply to this email.
                </div>
                <div class="footer-text">
                    © 2025 CampusAI. All rights reserved. Made with ❤️ for education.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Create college rejection email template
const createCollegeRejectionEmailTemplate = (collegeName, contactPerson, reason) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>College Request Update - CampusAI</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
                color: #ffffff;
                line-height: 1.6;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: #1a1a1a;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .header {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                opacity: 0.3;
            }
            
            .logo {
                font-size: 2.5rem;
                font-weight: bold;
                color: #000000;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
            }
            
            .title {
                font-size: 1.5rem;
                font-weight: bold;
                color: #000000;
                margin-bottom: 5px;
                position: relative;
                z-index: 1;
            }
            
            .subtitle {
                font-size: 1rem;
                color: #000000;
                opacity: 0.8;
                position: relative;
                z-index: 1;
            }
            
            .content {
                padding: 40px 30px;
                background: #1a1a1a;
            }
            
            .greeting {
                font-size: 1.2rem;
                margin-bottom: 20px;
                color: #ef4444;
            }
            
            .message {
                font-size: 1rem;
                margin-bottom: 30px;
                color: #e5e7eb;
                line-height: 1.8;
            }
            
            .reason-container {
                background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
                border: 2px solid #ef4444;
                border-radius: 15px;
                padding: 30px;
                margin: 30px 0;
                position: relative;
                overflow: hidden;
            }
            
            .reason-title {
                font-size: 1.2rem;
                color: #ef4444;
                margin-bottom: 15px;
                font-weight: 600;
                text-align: center;
            }
            
            .reason-text {
                font-size: 1rem;
                color: #ffffff;
                line-height: 1.6;
                text-align: center;
            }
            
            .instructions {
                background: rgba(59, 130, 246, 0.1);
                border-left: 4px solid #3b82f6;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 10px 10px 0;
            }
            
            .instructions h3 {
                color: #3b82f6;
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            
            .instructions ul {
                list-style: none;
                padding-left: 0;
            }
            
            .instructions li {
                margin-bottom: 8px;
                color: #e5e7eb;
                position: relative;
                padding-left: 20px;
            }
            
            .instructions li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #3b82f6;
                font-weight: bold;
            }
            
            .footer {
                background: #111827;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #374151;
            }
            
            .footer-text {
                color: #9ca3af;
                font-size: 0.9rem;
                margin-bottom: 15px;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .header, .content, .footer {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📋</div>
                <div class="title">Request Update</div>
                <div class="subtitle">College Registration Status</div>
            </div>
            
            <div class="content">
                <div class="greeting">Dear ${contactPerson},</div>
                
                <div class="message">
                    Thank you for your interest in joining CampusAI. We have carefully reviewed your application for <strong>${collegeName}</strong>.
                </div>
                
                <div class="reason-container">
                    <div class="reason-title">📝 Review Decision</div>
                    <div class="reason-text">
                        ${reason || 'After careful consideration, we are unable to approve your college registration request at this time. This decision was based on our current platform requirements and capacity.'}
                    </div>
                </div>
                
                <div class="instructions">
                    <h3>🔄 Next Steps:</h3>
                    <ul>
                        <li>Review the feedback provided above</li>
                        <li>Address any specific concerns mentioned</li>
                        <li>You may reapply in the future with updated information</li>
                        <li>Contact our support team if you have questions</li>
                    </ul>
                </div>
                
                <div class="message">
                    We appreciate your interest in CampusAI and encourage you to reapply in the future. 
                    If you have any questions about this decision or need assistance with your application, 
                    please don't hesitate to contact our support team.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    This is an automated message from CampusAI. Please do not reply to this email.
                </div>
                <div class="footer-text">
                    © 2025 CampusAI. All rights reserved. Made with ❤️ for education.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Send college approval email
const sendCollegeApprovalEmail = async (collegeName, contactPerson, email, password) => {
  try {
    const mailOptions = {
      from: `"CampusAI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎓 Congratulations! Your College Has Been Approved - CampusAI',
      html: createCollegeApprovalEmailTemplate(collegeName, contactPerson, email, password),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('College approval email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('College approval email sending error:', error);
    throw new Error('Failed to send college approval email');
  }
};

// Send college rejection email
const sendCollegeRejectionEmail = async (collegeName, contactPerson, email, reason) => {
  try {
    const mailOptions = {
      from: `"CampusAI" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '📋 College Registration Update - CampusAI',
      html: createCollegeRejectionEmailTemplate(collegeName, contactPerson, reason),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('College rejection email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('College rejection email sending error:', error);
    throw new Error('Failed to send college rejection email');
  }
};

// Generate secure password
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Verify transporter connection
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendCollegeApprovalEmail,
  sendCollegeRejectionEmail,
  generateSecurePassword,
  verifyConnection,
};
