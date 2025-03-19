# 🔗 TinyLink - Modern URL Shortener

<div align="center">

![TinyLink](https://img.shields.io/badge/TinyLink-v1.0.0-blue?style=for-the-badge&logo=link)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Self-hosted URL shortening that puts you in control.**
</div>

<p align="center">
  <img src="./generated-icon.png" alt="TinyLink Logo" width="200" height="200">
</p>

## ⚡ Quick Features

- **Fast URL Shortening** - Create shortened URLs in seconds
- **Custom Short Codes** - Choose your own memorable short codes
- **Click Analytics** - Track the performance of your links
- **Secure Authentication** - Protect your links with user accounts
- **Modern UI** - Beautiful, responsive interface using Tailwind CSS
- **Self-Hosted** - Full control over your link data and privacy

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/tinylink.git
cd tinylink

# Install dependencies
npm install

# Setup environment variables (see .env.example)
cp .env.example .env

# Start the development server
npm run dev
```

Visit `http://localhost:5000` in your browser.

## 📋 Requirements

- Node.js 18+
- PostgreSQL 15+
- Modern web browser

## 🧩 Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)

## 🔍 Features in Detail

### URL Management
```typescript
// Create a new short URL
const createUrl = async (originalUrl, customCode = '') => {
  const newUrl = await apiRequest('POST', '/api/urls', { 
    originalUrl,
    shortCode: customCode || undefined
  });
  return newUrl;
};
```

### Analytics Dashboard
Track clicks, referrers, and geographical data for your links with our built-in analytics:

- Total clicks over time
- Conversion rates
- Peak traffic times
- Device & browser statistics

### User Management
Create and manage user accounts with different permission levels:

- Regular users can create and manage their own links
- Admin users can view and manage all links in the system
- Set custom expiration dates for links

## 🧪 Example Usage

Here's how to use TinyLink in your applications:

```javascript
// Generate a short URL
const response = await fetch('/api/urls', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'your-user-id'
  },
  body: JSON.stringify({
    originalUrl: 'https://example.com/very/long/url/that/needs/shortening',
    shortCode: 'custom-code' // Optional
  })
});

const data = await response.json();
// data.shortUrl = 'http://yourdomain.com/custom-code'
```

## 🛠️ Configuration

TinyLink can be configured via environment variables:

```env
# Database configuration
DATABASE_URL=postgres://user:password@localhost:5432/tinylink

# Server configuration
PORT=5000
BASE_URL=http://localhost:5000

# Authentication (Supabase)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- This project was created in collaboration with AI assistance
- Icons provided by Lucide React
- UI Components by shadcn/ui
- Special thanks to the Drizzle ORM team for their amazing database tools