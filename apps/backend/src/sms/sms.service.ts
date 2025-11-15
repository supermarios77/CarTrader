import { Injectable, Logger } from '@nestjs/common';

/**
 * SMS Service - Sends verification codes via SMS
 * 
 * Development: Logs to console (free, no setup required)
 * Production: Can be swapped with Twilio, AWS SNS, or other SMS providers
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * Send verification code via SMS
   * 
   * In development: Logs to console
   * In production: Replace with actual SMS provider
   */
  async sendVerificationCode(phone: string, code: string): Promise<void> {
    if (process.env.NODE_ENV === 'production' && process.env.SMS_PROVIDER) {
      // Production: Use configured SMS provider
      await this.sendViaProvider(phone, code);
    } else {
      // Development: Log to console
      this.logger.log(`📱 SMS Verification Code for ${phone}: ${code}`);
      this.logger.log(`   (In production, this would be sent via SMS)`);
      this.logger.log(`   To use real SMS, set SMS_PROVIDER env var`);
    }
  }

  /**
   * Send SMS via configured provider
   * Currently supports: 'twilio', 'aws-sns', 'mock'
   */
  private async sendViaProvider(phone: string, code: string): Promise<void> {
    const provider = process.env.SMS_PROVIDER?.toLowerCase();

    switch (provider) {
      case 'twilio':
        await this.sendViaTwilio(phone, code);
        break;
      case 'aws-sns':
        await this.sendViaAwsSns(phone, code);
        break;
      case 'mock':
      default:
        this.logger.log(`📱 SMS Verification Code for ${phone}: ${code}`);
        break;
    }
  }

  /**
   * Send via Twilio (requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
   */
  private async sendViaTwilio(phone: string, code: string): Promise<void> {
    // TODO: Implement Twilio integration when needed
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    // 
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: `Your CarTrader verification code is: ${code}`,
    //   from: fromNumber,
    //   to: phone,
    // });
    
    this.logger.warn('Twilio integration not yet implemented. Logging to console.');
    this.logger.log(`📱 SMS Verification Code for ${phone}: ${code}`);
  }

  /**
   * Send via AWS SNS (requires AWS credentials)
   */
  private async sendViaAwsSns(phone: string, code: string): Promise<void> {
    // TODO: Implement AWS SNS integration when needed
    // const AWS = require('aws-sdk');
    // const sns = new AWS.SNS();
    // await sns.publish({
    //   PhoneNumber: phone,
    //   Message: `Your CarTrader verification code is: ${code}`,
    // }).promise();
    
    this.logger.warn('AWS SNS integration not yet implemented. Logging to console.');
    this.logger.log(`📱 SMS Verification Code for ${phone}: ${code}`);
  }
}

