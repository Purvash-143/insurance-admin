# Insurance Admin Portal - Deployment Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm start
   ```
   
3. **Login with demo credentials:**
   - Username: `admin`
   - Password: `insurance123`

## Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   npm run build
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard (optional):
   - `REACT_APP_SENDGRID_API_KEY` - For real email sending

### Option 2: Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy methods:
   - **Drag & Drop**: Upload `build` folder to Netlify
   - **Git**: Connect your repository and auto-deploy
   - **CLI**: 
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=build
     ```

### Option 3: GitHub Pages

1. Add to package.json:
   ```json
   {
     "homepage": "https://yourusername.github.io/insurance-admin-portal",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. Install and deploy:
   ```bash
   npm install --save-dev gh-pages
   npm run deploy
   ```

## Environment Variables (Optional)

For production email functionality, set:
- `REACT_APP_SENDGRID_API_KEY` - Your SendGrid API key

⚠️ **Security Note**: This demo app simulates email sending. For production, implement proper backend email services.

## Features Available After Deployment

✅ Admin login with session management  
✅ Member management and viewing  
✅ CSV/JSON file upload and analysis  
✅ Disease pattern detection  
✅ Email notification simulation  
✅ Interactive dashboard with charts  
✅ Mobile-responsive design  

## Demo Data Included

- 10 sample insurance members
- Health data with various diseases
- Sample CSV download for testing
- Pre-configured email templates

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Need Help?

- Check browser console for any errors
- Ensure JavaScript is enabled
- Try clearing browser cache if issues persist
