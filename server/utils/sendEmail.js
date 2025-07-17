const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
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

// Generic send email function
const sendEmail = async ({ to, subject, html, from = `"Barber Salon" <${process.env.EMAIL_USER}>` }) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from,
            to,
            subject,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
};

// Booking-specific email function
const sendBookingEmail = async (type, booking, extraData = {}) => {
    try {
        const customer = booking.customer;
        const barber = booking.barber;
        const shop = booking.shop;
        const slot = booking.slot;
        
        const bookingDate = new Date(slot.date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const services = booking.services.map(s => s.service.name).join(', ');
        
        let customerSubject, barberSubject, emailContent;
        
        switch (type) {
            case 'created':
                customerSubject = '🎉 Booking Confirmation - Barber Salon';
                barberSubject = '📅 New Booking Received - Barber Salon';
                
                const customerEmailContent = createBookingEmail({
                    title: 'Booking Confirmed!',
                    message: 'Your booking has been successfully created.',
                    booking,
                    bookingDate,
                    services,
                    recipient: 'customer',
                    status: 'pending'
                });
                
                const barberEmailContent = createBookingEmail({
                    title: 'New Booking Received!',
                    message: 'You have received a new booking request.',
                    booking,
                    bookingDate,
                    services,
                    recipient: 'barber',
                    status: 'pending'
                });
                
                // Send to customer
                await sendEmail({
                    to: customer.email,
                    subject: customerSubject,
                    html: customerEmailContent
                });
                
                // Send to barber
                await sendEmail({
                    to: barber.email,
                    subject: barberSubject,
                    html: barberEmailContent
                });
                break;
                
            case 'status_updated':
                const { oldStatus, newStatus } = extraData;
                customerSubject = `📋 Booking ${newStatus.toUpperCase()} - Barber Salon`;
                barberSubject = `📋 Booking ${newStatus.toUpperCase()} - Barber Salon`;
                
                emailContent = createBookingEmail({
                    title: `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
                    message: `Your booking status has been updated from ${oldStatus} to ${newStatus}.`,
                    booking,
                    bookingDate,
                    services,
                    recipient: 'both',
                    status: newStatus
                });
                
                // Send to both customer and barber
                await Promise.all([
                    sendEmail({
                        to: customer.email,
                        subject: customerSubject,
                        html: emailContent
                    }),
                    sendEmail({
                        to: barber.email,
                        subject: barberSubject,
                        html: emailContent
                    })
                ]);
                break;
                
            case 'cancelled':
                const { cancelReason, cancelledBy } = extraData;
                customerSubject = '❌ Booking Cancelled - Barber Salon';
                barberSubject = '❌ Booking Cancelled - Barber Salon';
                
                emailContent = createBookingEmail({
                    title: 'Booking Cancelled',
                    message: `This booking has been cancelled by ${cancelledBy}. Reason: ${cancelReason}`,
                    booking,
                    bookingDate,
                    services,
                    recipient: 'both',
                    status: 'cancelled'
                });
                
                // Send to both customer and barber
                await Promise.all([
                    sendEmail({
                        to: customer.email,
                        subject: customerSubject,
                        html: emailContent
                    }),
                    sendEmail({
                        to: barber.email,
                        subject: barberSubject,
                        html: emailContent
                    })
                ]);
                break;
        }
        
    } catch (error) {
        console.error('❌ Failed to send booking email:', error.message);
        throw error;
    }
};

// Create HTML email template
const createBookingEmail = ({ title, message, booking, bookingDate, services, recipient, status }) => {
    const statusColors = {
        pending: '#fbbf24',
        confirmed: '#10b981',
        'in-progress': '#3b82f6',
        completed: '#059669',
        cancelled: '#ef4444'
    };
    
    const statusColor = statusColors[status] || '#6b7280';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">✂️ Barber Salon</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">${title}</h2>
                <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">${message}</p>
                
                <!-- Status Badge -->
                <div style="margin: 20px 0;">
                    <span style="background-color: ${statusColor}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                        ${status}
                    </span>
                </div>
                
                <!-- Booking Details -->
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0; border-left: 4px solid ${statusColor};">
                    <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">Booking Details</h3>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #374151;">Booking ID:</strong>
                        <span style="color: #6b7280; font-family: monospace;">#${booking._id.toString().slice(-8).toUpperCase()}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #374151;">Date & Time:</strong>
                        <span style="color: #6b7280;">${bookingDate} at ${booking.slot.startTime} - ${booking.slot.endTime}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #374151;">Customer:</strong>
                        <span style="color: #6b7280;">${booking.customer.name}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #374151;">Barber:</strong>
                        <span style="color: #6b7280;">${booking.barber.name}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #374151;">Shop:</strong>
                        <span style="color: #6b7280;">${booking.shop.name}</span>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #374151;">Services:</strong>
                        <span style="color: #6b7280;">${services}</span>
                    </div>
                    
                    <div style="margin-bottom: 0;">
                        <strong style="color: #374151;">Total Amount:</strong>
                        <span style="color: #059669; font-weight: bold; font-size: 18px;">₹${booking.totalAmount}</span>
                    </div>
                    
                    ${booking.customerNotes ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                        <strong style="color: #374151;">Customer Notes:</strong>
                        <span style="color: #6b7280; font-style: italic;">${booking.customerNotes}</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Action Buttons -->
                ${status === 'pending' && recipient === 'barber' ? `
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #6b7280; margin-bottom: 20px;">Please confirm or manage this booking through your dashboard.</p>
                </div>
                ` : ''}
                
                <!-- Contact Info -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
                        If you have any questions, please contact us:<br>
                        📧 Email: ${process.env.EMAIL_USER}<br>
                        📞 Phone: ${booking.shop.contact?.phone || 'Contact shop directly'}
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    © 2025 Barber Salon. All rights reserved.<br>
                    This is an automated message, please do not reply.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    sendEmail,
    sendBookingEmail,
    createTransporter
};
