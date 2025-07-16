const nodemailer = require('nodemailer');

const createTransporter = () => {
    console.log('🔧 Creating email transporter...');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('🔑 EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    console.log('🏠 EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('🔌 EMAIL_PORT:', process.env.EMAIL_PORT);

    return nodemailer.createTransport({
        service: 'gmail',
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendVerificationEmail = async (email, verificationToken, name) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    if (process.env.NODE_ENV === 'development') {
        console.log('\n=== EMAIL VERIFICATION (DEV MODE) ===');
        console.log('📧 Email:', email);
        console.log('🔑 Token:', verificationToken);
        console.log('🔗 URL:', verificationUrl);
        console.log('=====================================\n');
    }

    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
        
        const mailOptions = {
            from: `"Barber Salon" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Email Verification - Barber Salon',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333; text-align: center;">Welcome to Barber Salon!</h2>
                    <p>Hi ${name},</p>
                    <p>Please verify your email by clicking the link below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                            Verify Email
                        </a>
                    </div>
                    <p>This link expires in 24 hours.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

const sendPasswordResetEmail = async (email, resetToken, name) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    if (process.env.NODE_ENV === 'development') {
        console.log('\n=== PASSWORD RESET EMAIL (DEV MODE) ===');
        console.log('📧 Email:', email);
        console.log('🔑 Reset Token:', resetToken);
        console.log('🔗 Reset URL:', resetUrl);
        console.log('======================================\n');
    }

    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email transporter verified for password reset');
        
        const mailOptions = {
            from: `"Barber Salon" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - Barber Salon',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p>Hi ${name || 'there'},</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                            Reset Password
                        </a>
                    </div>
                    <p><strong>This link expires in 30 minutes.</strong></p>
                    <p>If you didn't request this, ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Password reset email failed:', error.message);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
};

module.exports = { createTransporter, sendVerificationEmail, sendPasswordResetEmail };
                        