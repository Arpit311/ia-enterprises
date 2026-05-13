import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

// Format email HTML
function formatEmailHTML(formData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f7f8fc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
          color: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 1.5rem;
        }
        .content {
          margin-bottom: 2rem;
        }
        .field {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
        }
        .field:last-child {
          border-bottom: none;
        }
        .label {
          color: #0f172a;
          font-weight: 700;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
          display: block;
        }
        .value {
          color: #1f2937;
          font-size: 1rem;
          word-wrap: break-word;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 0.85rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Query from IA Enterprises Contact Form</h1>
        </div>
         <div class="content">
          <div class="field">
            <span class="label">Name</span>
            <div class="value">${escapeHtml(formData.name)}</div>
          </div>
          <div class="field">
            <span class="label">Email</span>
            <div class="value"><a href="mailto:${escapeHtml(formData.email)}">${escapeHtml(formData.email)}</a></div>
          </div>
          <div class="field">
            <span class="label">Phone</span>
            <div class="value">${escapeHtml(formData.phone || 'Not provided')}</div>
          </div>
          <div class="field">
            <span class="label">Firm Name</span>
            <div class="value">${escapeHtml(formData.firmName || 'Not provided')}</div>
          </div>
          <div class="field">
            <span class="label">City</span>
            <div class="value">${escapeHtml(formData.city || 'Not provided')}</div>
          </div>
          <div class="field">
            <span class="label">Message</span>
            <div class="value">${escapeHtml(formData.message).replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message from the IA Enterprises contact form.</p>
          <p>&copy; ${new Date().getFullYear()} IA Enterprises. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, firmName, city, message } = req.body

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required.'
      })
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Query from ${name}`,
      html: formatEmailHTML({ name, email, phone, firmName, city, message }),
      replyTo: email
    }

    // Send email
    await transporter.sendMail(mailOptions)

    console.log(`Email sent successfully to ${process.env.EMAIL_TO}`)

    res.json({ 
      success: true, 
      message: 'Your query has been sent successfully. We will get back to you soon!' 
    })
  } catch (error) {
    console.error('Email sending error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send query. Please try again later.' 
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
