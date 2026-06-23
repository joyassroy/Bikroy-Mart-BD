import nodemailer from "nodemailer";
import config from "../config";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"Bikroy-Mart-BD" <${config.smtp.user}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const generateOtpEmail = (otp: string, name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1E40AF;">Bikroy-Mart-BD Verification</h2>
    <p>Hi ${name},</p>
    <p>Your OTP for verification is:</p>
    <div style="background: #EFF6FF; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; color: #1E40AF; letter-spacing: 5px;">${otp}</span>
    </div>
    <p style="color: #64748B;">This OTP will expire in 10 minutes.</p>
    <p style="color: #64748B;">If you didn't request this, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
    <p style="color: #94A3B8; font-size: 12px;">© 2026 Bikroy-Mart-BD. All rights reserved.</p>
  </div>
`;
