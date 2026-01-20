# Invoice Generator - GST Compliant Micro-SaaS

A production-ready invoice generator for freelancers and small businesses with GST compliance, subscription management, and professional PDF generation.

## 🚀 Features

- ✅ **User Authentication** - Register, login, email verification, password reset
- ✅ **GST Calculations** - Automatic CGST+SGST (intra-state) or IGST (inter-state)
- ✅ **Professional PDFs** - Generate invoices with jsPDF
- ✅ **Client Management** - Add and manage clients
- ✅ **Subscription Plans** - Free (5 invoices/month) and Pro (unlimited)
- ✅ **Dashboard** - Statistics and quick actions
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

## 📦 Tech Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: SQLite (easy migration to PostgreSQL/Supabase)
- **Authentication**: JWT + bcrypt
- **PDF Generation**: jsPDF
- **Email**: Console logging (ready for Resend integration)
- **Payments**: Mock mode (ready for Razorpay integration)

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 🛠️ Installation

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm run init-db  # Initialize SQLite database
npm run dev      # Start development server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Start development server on port 5173
```

## 🔧 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./database/invoice.db
EMAIL_MODE=console
PAYMENT_MODE=mock
STORAGE_MODE=local
UPLOAD_DIR=./uploads
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📖 Usage

1. **Register an Account**
   - Go to http://localhost:5173/register
   - Create an account with email and password
   - Check console for verification link (email mode is set to console)

2. **Login**
   - Use your credentials to login
   - You'll be redirected to the dashboard

3. **Create Invoices**
   - Add clients first from the Clients page
   - Create invoices with automatic GST calculation
   - Download professional PDFs

4. **Subscription**
   - Free plan: 5 invoices/month, 3 clients max
   - Pro plan: Unlimited (mock payment for testing)

## 🗂️ Project Structure

```
Invoice/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, environment config
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth, rate limiting, errors
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (GST, PDF, email)
│   │   ├── utils/           # Helpers, validators
│   │   ├── app.js           # Express app
│   │   └── server.js        # Server entry point
│   ├── database/            # SQLite database
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify-email?token=xxx` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile
- `POST /api/users/onboarding` - Complete onboarding

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Invoices
- `GET /api/invoices` - List invoices (with filters)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `POST /api/invoices/:id/finalize` - Finalize invoice
- `GET /api/invoices/:id/pdf` - Download PDF
- `GET /api/invoices/stats` - Dashboard statistics

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `POST /api/subscriptions/verify` - Verify payment
- `GET /api/subscriptions/status` - Get plan status
- `POST /api/subscriptions/cancel` - Cancel subscription

## 🚀 Production Deployment

### Ready for Production Services

The application is designed to easily integrate with production services:

1. **Database**: Migrate from SQLite to Supabase PostgreSQL
2. **Email**: Switch from console to Resend
3. **Payments**: Integrate Razorpay
4. **Storage**: Use Firebase Storage for logos

Simply update environment variables - no code changes needed!

## 📝 Testing

### Test User Flow
1. Register → Check console for verification link
2. Click verification link → Login
3. Add a client
4. Create an invoice
5. Download PDF
6. Test subscription upgrade (mock payment)

### GST Calculation Test
- **Same State**: Client in Maharashtra, Business in Maharashtra → CGST 9% + SGST 9%
- **Different State**: Client in Delhi, Business in Maharashtra → IGST 18%

## 🐛 Troubleshooting

### Database Issues
```bash
cd backend
rm database/invoice.db  # Delete old database
npm run init-db         # Reinitialize
```

### Port Already in Use
```bash
# Backend (change PORT in .env)
PORT=5001

# Frontend (change in vite.config.js)
server: { port: 5174 }
```

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

This is a complete production-ready application. Feel free to fork and customize for your needs!

## 📧 Support

For issues or questions, check the console logs for detailed error messages.

---

**Built with ❤️ for freelancers and small businesses**
