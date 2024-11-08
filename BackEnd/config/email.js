// config/email.js

const nodemailer = require('nodemailer');

// Create reusable transporter configuration
const createTransporter = () => {
    // iCloud Mail SMTP configuration
    if (process.env.EMAIL_PROVIDER === 'icloud') {
        return nodemailer.createTransport({
            host: 'smtp.mail.me.com',
            port: 587,
            secure: false, // use TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: true
            }
        });
    }
    
    // Gmail configuration
    if (process.env.EMAIL_PROVIDER === 'gmail') {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Yahoo Mail configuration
    if (process.env.EMAIL_PROVIDER === 'yahoo') {
        return nodemailer.createTransport({
            host: 'smtp.mail.yahoo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Outlook/Hotmail configuration
    if (process.env.EMAIL_PROVIDER === 'outlook') {
        return nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Custom SMTP configuration
    if (process.env.EMAIL_PROVIDER === 'custom') {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Default to iCloud since that's what the business uses
    return nodemailer.createTransport({
        host: 'smtp.mail.me.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        }
    });
};

// Email sending function with retry logic
const sendEmail = async (mailOptions) => {
    const transporter = createTransporter();
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error(`Email sending attempt ${attempt} failed:`, error);
            lastError = error;
            
            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError.message}`);
};

module.exports = {
    sendEmail
};