# 🔗 TinyLink - Modern URL Shortener

<div align="center">

![TinyLink](https://img.shields.io/badge/TinyLink-v1.0.0-blue?style=for-the-badge&logo=link)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.29.0-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMjU2IDhDMTE5LjA0MyA4IDggMTE5LjA4IDggMjU2YzAgMTM2Ljk5NyAxMTEuMDQzIDI0OCAyNDggMjQ4czI0OC0xMTEuMDAzIDI0OC0yNDhDNTA0IDExOS4wOCAzOTIuOTU3IDggMjU2IDh6bTAgMTEwYzIzLjE5NiAwIDQyIDE4LjgwNCA0MiA0MnMtMTguODA0IDQyLTQyIDQyLTQyLTE4LjgwNC00Mi00MiAxOC44MDQtNDIgNDItNDJ6bTU2IDI1NGMwIDYuNjI3LTUuMzczIDEyLTEyIDEyaC04OGMtNi42MjcgMC0xMi01LjM3My0xMi0xMnYtMjRjMC02LjYyNyA1LjM3My0xMiAxMi0xMmgxMnYtNjRoLTEyYy02LjYyNyAwLTEyLTUuMzczLTEyLTEydi0yNGMwLTYuNjI3IDUuMzczLTEyIDEyLTEyaDY0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJ2MTAwaDEyYzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJ2MjR6Ii8+PC9zdmc+)](https://orm.drizzle.team/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-blue?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Your privacy-focused, self-hosted alternative to commercial URL shorteners.**
</div>

<!--p align="center">
  <img src="./generated-icon.png" alt="TinyLink Logo" width="200" height="200">
</p-->

## 💡 Why TinyLink?

TinyLink is a **100% open-source alternative** to commercial URL shortening services, designed for individuals and organizations who value:

- **Full Data Ownership**: Your links, analytics, and user data stay on your servers, not in the cloud
- **Enhanced Privacy**: No third-party tracking or data collection from your shortened links
- **Security First**: Reduce phishing risks by having a trusted, self-hosted domain for all your shortened URLs
- **No Vendor Lock-in**: Freedom from subscription fees or unexpected service shutdowns
- **Customization Freedom**: Modify and extend the codebase to fit your exact requirements
- **Unlimited Usage**: Create as many shortened links as your infrastructure can handle

## ⚡ Quick Features

- **Fast URL Shortening** - Create shortened URLs in seconds
- **Custom Short Codes** - Choose your own memorable short codes
- **Click Analytics** - Track the performance of your links
- **Secure Authentication** - Protect your links with user accounts
- **Modern UI** - Beautiful, responsive interface using Tailwind CSS
- **Self-Hosted** - Full control over your link data and privacy

## 🚀 Quick Start

### Standard Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Copy `.env.development.sample` to `.env.development`
4. Start the development server with `npm run dev`

### Using Docker

1. Clone the repository
2. For development: 
   - Copy `.env.development.sample` to `.env.development`
   - Run `docker-compose -f docker-compose.dev.yml up`
3. For production:
   - Copy `.env.production.sample` to `.env.production` and edit settings
   - Run `docker-compose up -d`

Visit `http://localhost:5000` in your browser.

## 📋 Requirements

### Standard Installation
- Node.js 18+
- PostgreSQL 15+
- Modern web browser

### Docker Installation (Alternative)
- Docker
- Docker Compose

## 🧩 Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)

## 🔍 Features in Detail

### URL Management
- Create short URLs with either auto-generated or custom codes
- Manage and organize your shortened links in one place
- Simple API for programmatic URL creation and management

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

## 🛠️ Configuration

TinyLink can be configured via environment variables provided in the sample files:

- `.env.development.sample` - Template for development configuration
- `.env.production.sample` - Template for production configuration

### Docker Configuration

Two Docker Compose configurations are provided:

1. **Development** (`docker-compose.dev.yml`):
   - Hot-reloading enabled
   - Source code is mounted as volumes
   - Automatic database schema initialization

2. **Production** (`docker-compose.yml`):
   - Optimized build with minimized dependencies
   - Database ports not exposed to the internet
   - Automatic container restarts
   - Database initialization service for first-time setup

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🛡️ Security & Privacy Advantages

As an open-source, self-hosted solution, TinyLink offers significant advantages:

- **No Data Mining**: Your link data isn't being harvested for advertising or analytics
- **Enhanced Trust**: Users can trust links from your organization's domain instead of third-party services
- **Custom Security Policies**: Implement your own security requirements without limitations
- **Compliance Friendly**: Keep sensitive links within your regulatory boundaries (GDPR, HIPAA, etc.)
- **Transparency**: The entire codebase is open for security review, with no hidden tracking or backdoors
- **Audit Control**: Full access to server logs and analytics data for security monitoring

## 🔄 Migrating from Commercial Services

TinyLink makes it easy to migrate from paid services:

1. **Export links** from your current service (most provide CSV export)
2. **Import links** using our API or bulk import tool
3. **Update DNS** to point your domain to your TinyLink instance
4. **Enjoy freedom** from subscription fees and privacy concerns

## 🙏 Acknowledgements

- This project was created in collaboration with AI assistance
- Icons provided by Lucide React
- UI Components by shadcn/ui
- Special thanks to the Drizzle ORM team for their amazing database tools