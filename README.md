# IA Enterprises Website

A modern, responsive website for IA Enterprises, showcasing their expertise in manufacturing nylon polymer sheets for cardboard and carton box printing applications.

## Overview

IA Enterprises specializes in producing high-quality nylon polymer sheets designed for premium print adhesion on packaging materials. This website serves as a digital presence to highlight their manufacturing capabilities, trusted partner brands, facilities, and service areas across India.

## Features

- **Hero Section**: Eye-catching introduction with company branding and call-to-action
- **About Section**: Detailed information about manufacturing processes and quality focus
- **Trusted Partners**: Interactive carousel showcasing 8+ partner brands with smooth animations
- **Facilities**: Overview of production capabilities and quality assurance
- **Service Areas**: List of cities served across Uttarakhand and surrounding regions
- **Contact Form**: Functional contact form with validation and email integration
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Proper alt texts, semantic HTML, and keyboard navigation

## Tech Stack

- **Frontend**: React 18 with Vite build tool
- **Styling**: Custom CSS with CSS variables for theming
- **Backend**: Node.js with Express for contact form handling
- **Email Service**: Nodemailer for form submissions
- **Deployment**: Ready for static hosting (e.g., Netlify, Vercel) with serverless functions

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arpit311/IA_enterprises.git
   cd ia_enterprises
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Environment Variables
Create a `.env` file in the root directory (not committed to git):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_TO=recipient-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Deployment to Vercel

1. **Connect GitHub to Vercel**
   - Sign up at [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Set Environment Variables in Vercel**
   - Go to Project Settings > Environment Variables
   - Add the same variables as in `.env`

3. **Deploy**
   - Vercel will automatically build and deploy
   - The contact form will work via serverless functions

### Local Server Setup (Alternative)

1. **Start the backend server**
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:3000`

## Usage

### For Visitors
- Browse company information and capabilities
- View partner brands in the interactive carousel
- Learn about service areas and facilities
- Submit inquiries via the contact form

### For Developers
- Modify content in `src/App.jsx`
- Update styles in `src/App.css`
- Add new sections or features as needed
- Customize partner images in `public/` folder

## Project Structure

```
ia_enterprises/
├── public/                 # Static assets (images, logos)
├── src/
│   ├── App.jsx           # Main React component
│   ├── App.css           # Main stylesheet
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── server.js             # Express server for contact form
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md             # This file
```

## Use Case

This website serves as a comprehensive business showcase for IA Enterprises, enabling:

- **Lead Generation**: Contact form captures potential client inquiries
- **Brand Credibility**: Partner carousel demonstrates industry partnerships
- **Regional Presence**: Cities list shows extensive service coverage
- **Professional Image**: Modern design reflects manufacturing expertise
- **Information Access**: Centralized hub for company details and capabilities

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is proprietary to IA Enterprises. All rights reserved.

## Contact

For technical inquiries about this website:
- Email: kuldeepbhatnagar311@gmail.com
- Phone: +91 7017150799

## Developer Details

- Phone: 9548832221
- Name: Arpit Bhatnagar
- Email: arpitbhatnagar097@gmail.com</content>
<parameter name="filePath">README.md