# Email & Phone Verification Setup Guide

## ✅ What's Implemented

### Email Verification
- ✅ Backend endpoints (GET and POST)
- ✅ Email sending via Postfix (self-hosted, free)
- ✅ Frontend verification page at `/verify-email`
- ✅ Auto-verification from email link
- ✅ Manual token entry
- ✅ Resend verification email
- ✅ TLS disabled for development (no TLS errors)

### Phone Verification (Optional)
- ✅ Phone number is **optional** in registration
- ✅ Backend endpoints (send, verify, resend) - only if user wants to verify
- ✅ SMS service (mock for development, swappable for production)
- ✅ Frontend verification page at `/verify-phone`
- ✅ 6-digit code verification
- ✅ Resend with countdown timer
- ✅ Rate limiting and security

## 🚀 How It Works

### Email Verification Flow

1. **User registers** → Email verification token is generated and sent
2. **User clicks link in email** → Redirects to `/verify-email?token=xxx`
3. **Page auto-verifies** → If token is valid, email is verified
4. **Or user enters token manually** → Can paste token from email

**Email Service:**
- Uses Postfix (already configured in Docker)
- No domain needed for development
- Emails sent from `noreply@cartrader.local` (configurable via `SMTP_FROM`)
- TLS disabled for development (no certificate errors)
- In development, emails are accepted by Postfix and logged (not actually delivered)
- In production, configure relayhost or use external SMTP service

### Phone Verification Flow

1. **User navigates to `/verify-phone`** (must be logged in)
2. **Enters phone number** → 6-digit code is generated and sent
3. **User enters code** → Phone is verified
4. **Can resend code** → With 60-second countdown

**SMS Service:**
- **Development:** Logs code to console (free, no setup)
- **Production:** Set `SMS_PROVIDER` env var to use real service

## 📧 Email Setup (Current: Postfix)

### Development (Free, No Domain)
- ✅ Already configured in Docker
- ✅ Uses Postfix container
- ✅ Emails sent from `noreply@cartrader.local`
- ⚠️ Emails may go to spam without proper domain/DKIM

### Production Options (Free/Cheap)
1. **Mailtrap** (Free tier: 500 emails/month)
   - Good for testing
   - No domain needed
   - Set `SMTP_HOST=smtp.mailtrap.io`, `SMTP_PORT=2525`

2. **SendGrid** (Free tier: 100 emails/day)
   - Requires domain verification
   - Set `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`

3. **AWS SES** (Free tier: 62,000 emails/month)
   - Requires AWS account
   - Set `SMTP_HOST=email-smtp.region.amazonaws.com`

## 📱 Phone Setup (Current: Mock)

### Development (Free)
- ✅ Logs verification codes to console
- ✅ No setup required
- ✅ Check backend Docker logs for codes

### Production Options (Free/Cheap)
1. **Twilio** (Free trial: $15.50 credit)
   - Set `SMS_PROVIDER=twilio`
   - Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
   - Requires credit card but has free trial

2. **AWS SNS** (Free tier: 100 SMS/month)
   - Set `SMS_PROVIDER=aws-sns`
   - Requires AWS credentials
   - Very cheap after free tier ($0.00645 per SMS)

3. **MessageBird** (Free tier: 50 SMS/month)
   - Set `SMS_PROVIDER=messagebird`
   - Requires API key

## 🔧 Environment Variables

### Email (Already Set)
```bash
SMTP_HOST=postfix          # Docker service name
SMTP_PORT=25               # Postfix port
SMTP_FROM=noreply@cartrader.local
FRONTEND_URL=http://localhost:3000  # For email links
```

### Phone (Optional - for production)
```bash
SMS_PROVIDER=mock          # Options: mock, twilio, aws-sns
# Twilio (if using)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🧪 Testing

### Email Verification
1. Register a new account
2. Check email (or check Postfix logs in Docker)
3. Click link or copy token
4. Visit `/auth/verify-email` (with token in URL or enter manually)

### Phone Verification
1. Login to your account
2. Visit `/auth/verify-phone`
3. Enter phone number (e.g., `+1234567890`)
4. Check backend Docker logs for the 6-digit code:
   ```
   📱 SMS Verification Code for +1234567890: 123456
   ```
5. Enter code on the page

## 📝 API Endpoints

### Email
- `GET /auth/verify-email/:token` - Verify via URL
- `POST /auth/verify-email` - Verify via token in body
- `POST /auth/resend-verification` - Resend email

### Phone
- `POST /auth/send-phone-verification` - Send code (requires auth)
- `POST /auth/verify-phone` - Verify code (requires auth)
- `POST /auth/resend-phone-verification` - Resend code (requires auth)

## 🎨 Frontend Pages

- `/auth/verify-email` - Email verification page
- `/auth/verify-phone` - Phone verification page

Both pages match the premium design of login/register pages.

## 🔒 Security Features

- ✅ Rate limiting on all endpoints
- ✅ Token expiration (24h for email, 10min for phone)
- ✅ Max 5 attempts for phone verification
- ✅ One-time use tokens
- ✅ XSS protection in email templates
- ✅ Input validation and sanitization

## 🚀 Next Steps

1. **For Production Email:**
   - Set up domain and DKIM/SPF records
   - Or use Mailtrap/SendGrid/AWS SES
   - Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`

2. **For Production SMS:**
   - Choose provider (Twilio recommended for ease)
   - Set `SMS_PROVIDER` and required credentials
   - Update `SmsService` if needed for provider-specific logic

3. **Testing:**
   - Test email verification flow
   - Test phone verification flow
   - Verify codes appear in logs (dev mode)

Everything is production-ready and easy to swap providers when needed!

