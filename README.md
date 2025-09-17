# Insurance Admin Portal

A comprehensive web application for managing insurance members, analyzing health data, and sending notifications.

## Features

- **Admin Authentication**: Secure login with static credentials and session management
- **Member Management**: View and manage insurance members with detailed information
- **File Analysis**: Upload CSV/JSON files to analyze health data and identify common diseases
- **SMS Notifications**: Automatic SMS alerts when disease patterns are detected in uploaded data
- **Email Notifications**: Send email notifications to members using customizable templates
- **Disease Alert System**: Automatic SMS notifications to all members when significant health trends are detected
- **Analytics Dashboard**: Visual charts and statistics for member data and health trends
- **Responsive Design**: Modern UI built with Material-UI components

## Demo Credentials

- **Username**: admin
- **Password**: insurance123

## Tech Stack

- **Frontend**: React 18 with hooks and context
- **UI Library**: Material-UI (MUI) v5
- **Charts**: Recharts for data visualization
- **State Management**: React Context API
- **File Processing**: Browser FileReader API
- **Notifications**: SendGrid (email) and Twilio (SMS) integration (demo mode)
- **Deployment**: Vercel/Netlify ready

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your API keys (optional for demo):
```
REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add environment variables from `.env.example`

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Drag and drop the `build` folder to Netlify
   - Or connect your Git repository

3. Set environment variables in Netlify:
   - Go to Site Settings → Environment Variables
   - Add variables from `.env.example`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SENDGRID_API_KEY` | SendGrid API key for sending emails | No (demo mode works without it) |
| `REACT_APP_TWILIO_ACCOUNT_SID` | Twilio Account SID for SMS | No (demo mode works without it) |
| `REACT_APP_TWILIO_AUTH_TOKEN` | Twilio Auth Token for SMS | No (demo mode works without it) |
| `REACT_APP_TWILIO_PHONE_NUMBER` | Twilio phone number for SMS | No (demo mode works without it) |
| `REACT_APP_APP_NAME` | Application name | No |
| `REACT_APP_VERSION` | Application version | No |

## Security Notes

- **Static Credentials**: For demo purposes only. In production, implement proper authentication
- **Client-side Email**: Current implementation simulates email sending. In production, use a backend service
- **API Keys**: Never expose real API keys in frontend code. Use backend proxy services

## File Upload Formats

### CSV Format
```csv
Name,Email,Disease,Age,Phone
John Doe,john@email.com,Hypertension,35,+1-555-0001
Jane Smith,jane@email.com,Diabetes,28,+1-555-0002
```

### JSON Format
```json
{
  "members": [
    {
      "name": "John Doe",
      "email": "john@email.com",
      "disease": "Hypertension",
      "age": 35,
      "phone": "+1-555-0001"
    }
  ]
}
```

## Available Scripts

### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm test`
Launches the test runner in interactive watch mode.

## License

This project is licensed under the MIT License.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
