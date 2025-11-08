const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
};

const sendEmail = async (to, subject, html, userId = null, template = 'generic') => {
  const transporter = createTransporter();
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });

    await prisma.emailLog.create({
      data: {
        userId,
        toEmail: to,
        subject,
        template,
        status: 'SENT'
      }
    });

    return { success: true };
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        userId,
        toEmail: to,
        subject,
        template,
        status: 'FAILED',
        error: error.message
      }
    });

    throw error;
  }
};

const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <h2>Welcome to WorkZen HRMS</h2>
    <p>Hi ${user.name},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verifyUrl}">Verify Email</a>
    <p>This link expires in 24 hours.</p>
  `;
  
  return sendEmail(user.email, 'Verify Your Email - WorkZen HRMS', html, user.id, 'verification');
};

const sendInviteEmail = async (user, token) => {
  const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
  const html = `
    <h2>You're Invited to WorkZen HRMS</h2>
    <p>Hi ${user.name},</p>
    <p>You've been invited to join WorkZen HRMS as ${user.role}.</p>
    <p>Click the link below to set your password and get started:</p>
    <a href="${inviteUrl}">Accept Invitation</a>
    <p>This invitation expires in 24 hours.</p>
  `;
  
  return sendEmail(user.email, 'Invitation to WorkZen HRMS', html, user.id, 'invitation');
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
  `;
  
  return sendEmail(user.email, 'Password Reset - WorkZen HRMS', html, user.id, 'password_reset');
};

const sendTimeOffNotification = async (employee, timeOff, type) => {
  const subject = type === 'request' ? 'New Time Off Request' : `Time Off Request ${timeOff.status}`;
  const html = `
    <h2>Time Off ${type === 'request' ? 'Request' : 'Update'}</h2>
    <p>Employee: ${employee.user.name}</p>
    <p>Type: ${timeOff.type}</p>
    <p>From: ${timeOff.fromDate.toDateString()}</p>
    <p>To: ${timeOff.toDate.toDateString()}</p>
    <p>Reason: ${timeOff.reason}</p>
    <p>Status: ${timeOff.status}</p>
  `;
  
  return sendEmail(employee.user.email, subject, html, employee.userId, 'timeoff_notification');
};

const sendPayslipNotification = async (employee, payslipId) => {
  const html = `
    <h2>Your Payslip is Ready</h2>
    <p>Hi ${employee.user.name},</p>
    <p>Your payslip has been generated and is ready for download.</p>
    <p>Login to your WorkZen HRMS account to view and download your payslip.</p>
  `;
  
  return sendEmail(employee.user.email, 'Payslip Generated - WorkZen HRMS', html, employee.userId, 'payslip_notification');
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendInviteEmail,
  sendPasswordResetEmail,
  sendTimeOffNotification,
  sendPayslipNotification
};