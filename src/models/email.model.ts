import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export interface EmailConfig {
  smtp: nodemailer.TransportOptions;
  from: string;
}
