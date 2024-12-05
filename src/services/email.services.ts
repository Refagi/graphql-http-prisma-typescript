import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import config from '../config/config';
import { logger } from '../config/logger';

const transport: Transporter = nodemailer.createTransport(config.email.smtp as SendMailOptions);

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env')
    );
}

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const msg: SendMailOptions = {
    from: config.email.from,
    to,
    subject,
    text
  };

  const res = await transport.sendMail(msg);
  console.log(res, 'RESPONSE EMAIL');
};

export const sendResetPasswordEmail = async (to: string, token: string): Promise<void> => {
  const subject = 'Reset password';
  // const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const resetPasswordUrl = `http://localhost:4000/graphql`;
  const text = `Dear user,
  To reset your password, click on this link: ${resetPasswordUrl}
  If you did not request any password resets, then ignore this email.`;

  await sendEmail(to, subject, text);
};

export const sendVerificationEmail = async (to: string, token: string): Promise<void> => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
  To verify your email, click on this link: ${verificationEmailUrl}
  If you did not create an account, then ignore this email.`;

  const res = await sendEmail(to, subject, text);
  console.log(res, 'RESPONSE EMAIL');
};

export default { transport };
