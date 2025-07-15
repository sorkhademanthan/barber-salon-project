# SmartQueue Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Git installed

### Installation Steps

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd smartqueue-barber
```

2. **Install root dependencies**

```bash
npm install
```

3. **Install all dependencies (client + server)**

```bash
npm run install-deps
```

4. **Setup environment variables**

```bash
# Copy example env file
cp server/.env.example server/.env

# Edit the .env file with your configuration
# - Set your MongoDB connection string
# - Set a strong JWT secret
# - Configure other services as needed
```

5. **Start development servers**

```bash
npm run dev
```

This will start:

- Backend API server on http://localhost:5000
- Frontend React app on http://localhost:5173

## 📁 Project Structure

```
smartqueue-barber/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API service functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── controllers/       # Route handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
└── docs/                 # Documentation
```

## 🛠️ Development Commands

```bash
# Start development (both client & server)
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build for production
npm run build

# Install all dependencies
npm run install-deps
```

## 🧪 Testing the Setup

1. **Backend Health Check**

   - Visit: http://localhost:5000/api/health
   - Should return: `{"status": "OK", "message": "SmartQueue API is running!"}`

2. **Frontend**

   - Visit: http://localhost:5173
   - Should show the SmartQueue landing page

3. **Database Connection**
   - Check terminal logs for "MongoDB Connected Successfully!"

## 📋 Next Steps

After setup, you can:

1. **Test Authentication**

   - Register a new user via the frontend
   - Login and check JWT token functionality

2. **Create Sample Data**

   - Use the API endpoints to create test shops
   - Add sample bookings

3. **Explore Features**
   - Real-time queue updates
   - Booking system
   - QR code functionality

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**

   - Ensure MongoDB is running locally
   - Check connection string in `.env`

2. **Port Already in Use**

   - Change ports in package.json scripts
   - Kill existing processes

3. **Dependencies Issues**
   - Delete `node_modules` folders
   - Run `npm run install-deps` again

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Shop Endpoints

- `GET /api/shops` - Get all shops
- `GET /api/shops/:id` - Get shop details

### Booking Endpoints

- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking

## 🔧 Configuration

### Environment Variables (.env)

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartqueue-barber
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

## 📝 Development Workflow

1. **Feature Development**

   - Create feature branch from main
   - Implement backend API first
   - Test with Postman/Thunder Client
   - Implement frontend integration
   - Test end-to-end functionality

2. **Code Standards**
   - Use ESLint for code formatting
   - Follow component naming conventions
   - Add proper error handling
   - Include loading states

## 🚀 Deployment

Coming soon: Deployment guides for:

- Vercel (Frontend)
- Render/Railway (Backend)
- MongoDB Atlas (Database)
