# Email Configuration Setup

✅ **Email functionality is now working!** The contact form sends emails successfully.

To enable email notifications for contact form submissions, follow these steps:

## 1. Gmail Setup (Using App Passwords)

1. Enable 2-Factor Authentication on your Gmail account if not already done
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Click on "App passwords" (appears when 2FA is enabled)
4. Select "Mail" and "Windows Computer"
5. Google will generate a 16-character app password
6. Copy this password

## 2. Environment Configuration

Open `.env` file and update:

```
EMAIL_USER=kuldeepbhatnagar9738@gmail.com
EMAIL_PASSWORD=ocvalwwutpktffx
EMAIL_TO=kuldeepbhatnagar311@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

Replace `your_16_char_app_password_here` with the app password from step 1.

## 3. Run the Server

In a new terminal, run:

```bash
npm run server
```

The server will start on `http://localhost:3001`

## 4. Keep Both Running

You need to keep both processes running:
- **Terminal 1**: `npm run dev` (Frontend on port 5173)
- **Terminal 2**: `npm run server` (Backend on port 3001)

## 5. Test the Form

Fill out the contact form on your website and submit. The email will be sent to `kuldeepbhatnagar311@gmail.com` with a formatted HTML layout including name, email, phone, firm name, city, and message.

## Troubleshooting

- **"Less secure apps" error**: Make sure you're using an App Password, not your regular Gmail password
- **Connection refused error**: Make sure the server is running with `npm run server`
- **CORS error**: The frontend is configured to accept requests from `http://localhost:3001`

## Using a Different Email Service

If you want to use a different email service (SendGrid, Mailgun, etc.), update the `server.js` configuration accordingly.
