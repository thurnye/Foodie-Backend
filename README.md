# Foodie Backend - Phase 1

A microservices-based backend for the Foodie Blog platform built with Node.js, TypeScript, Express, and MongoDB.

## Architecture

This project follows a microservices architecture with:

- **API Gateway** - Central entry point routing requests to services (Port 3000)
- **Auth Service** - JWT-based authentication & authorization (Port 3001)
- **User Service** - User profile management (Port 3002)
- **Recipe Service** - _Phase 2_ - Recipe CRUD and cookbook generation (Port 3003)
- **Event Service** - _Phase 2_ - Event creation and management (Port 3004)
- **community Service** - _Phase 2_ - Discussion forums (Port 3005)
- **Group Service** - _Phase 2_ - Community groups (Port 3006)
- **Chat Service** - _Phase 2_ - Real-time messaging with Socket.IO (Port 3007)
- **News Service** - _Phase 2_ - News feeds and authors (Port 3008)

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Joi
- **Logging**: Winston
- **Real-time**: Socket.IO (stub for Phase 2)
- **Security**: Helmet, CORS, bcrypt, rate-limiter-flexible
- **Process Manager**: PM2
- **Development**: ts-node-dev

## Project Structure

```
backend/
├── api-gateway/          # API Gateway (proxy to all services)
├── services/
│   ├── auth-service/     # ✅ Authentication (IMPLEMENTED)
│   ├── user-service/     # ✅ User profiles (IMPLEMENTED)
│   ├── recipe-service/   # 🔨 Phase 2
│   ├── event-service/    # 🔨 Phase 2
│   ├── community-service/    # 🔨 Phase 2
│   ├── group-service/    # 🔨 Phase 2
│   ├── chat-service/     # 🔨 Phase 2 (Socket.IO stub ready)
│   └── news-service/     # 🔨 Phase 2
├── libs/                 # Shared utilities
├── scripts/seed/         # Database seeding scripts
└── ecosystem.config.js   # PM2 configuration

```

## Prerequisites

- Node.js v18+
- MongoDB running locally on `mongodb://localhost:27017/FoodieBlog`
- npm or yarn

## Installation

1. **Install root dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Install libs dependencies**:

   ```bash
   cd libs
   npm install
   npm run build
   cd ..
   ```

3. **Install API Gateway dependencies**:

   ```bash
   cd api-gateway
   npm install
   cd ..
   ```

4. **Install service dependencies**:

   ```bash
   cd services/auth-service
   npm install
   cd ../user-service
   npm install
   cd ../..
   ```

5. **Create .env files** (copy from .env.example):

   ```bash
   cp api-gateway/.env.example api-gateway/.env
   cp services/auth-service/.env.example services/auth-service/.env
   cp services/user-service/.env.example services/user-service/.env
   ```

6. **Update .env files** with your configuration (especially JWT secrets)

## Running the Application

### Development Mode (Recommended)

Run all services concurrently:

```bash
npm run dev
```

This starts:

- API Gateway on http://localhost:3000
- Auth Service on http://localhost:3001
- User Service on http://localhost:3002

### Individual Services

Run services separately:

```bash
# API Gateway
npm run dev:gateway

# Auth Service
npm run dev:auth

# User Service
npm run dev:user
```

### Production Mode (with PM2)

1. **Build all services**:

   ```bash
   npm run build
   ```

2. **Start with PM2**:

   ```bash
   npm run pm2:start
   ```

3. **Other PM2 commands**:
   ```bash
   npm run pm2:stop     # Stop all services
   npm run pm2:restart  # Restart all services
   npm run pm2:delete   # Remove from PM2
   pm2 logs             # View logs
   pm2 monit            # Monitor services
   ```

## Database Seeding

Seed the database with test users:

```bash
npm run seed
```

This creates sample users including:

- `john.doe@example.com` / `Password123`
- `admin@foodie.com` / `AdminPass123`

To clear existing data before seeding:

```bash
CLEAR_DB=true npm run seed
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns access token + sets refresh cookie)
- `POST /api/auth/logout` - Logout (clears refresh cookie)
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/email/verify` - Verify email
- `POST /api/auth/email/resend-verification` - Resend verification
- `POST /api/auth/reset-request` - Request password reset
- `POST /api/auth/reset` - Reset password with token
- `POST /api/auth/change` - Change password (requires auth)

### User Profile (`/api/user`)

- `POST /api/user/create` - Create user profile
- `POST /api/user/edit` - Update profile (requires auth)
- `GET /api/user/:id` - Get user profile by ID
- `GET /api/user?page=1&limit=10` - List users (pagination)

### Health & Monitoring

- `GET /health` - Health check (all services)
- `GET /metrics` - Prometheus metrics
- `GET /api-docs` - API documentation (Swagger stub)

## Testing the API

### Using cURL

**Register a new user**:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser"
  }'
```

**Login**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }' \
  -c cookies.txt -v
```

**Get current user** (use token from login response):

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get user profile**:

```bash
curl -X GET http://localhost:3000/api/user/USER_ID
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:3000`
3. For authenticated routes, add `Authorization: Bearer <token>` header

## Environment Variables

### API Gateway (.env)

```env
PORT=3000
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
JWT_ACCESS_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Auth Service (.env)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/FoodieBlog
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### User Service (.env)

```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/FoodieBlog
JWT_ACCESS_SECRET=your-access-secret
```

## Authentication Flow

1. **Register**: Create account → Email verification token sent
2. **Login**: Credentials → Access token (header) + Refresh token (HTTP-only cookie)
3. **Access Protected Routes**: Include `Authorization: Bearer <access_token>` header
4. **Token Refresh**: When access token expires, use `/api/auth/refresh` (uses cookie)
5. **Logout**: Clears refresh token cookie

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies for refresh tokens
- Rate limiting on all endpoints
- Helmet for security headers
- CORS configuration
- Input validation with Joi
- Request ID tracing
- Centralized error handling

## Logging

Logs are stored in:

- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

Logs include:

- Request ID for tracing
- User info for authenticated requests
- Timestamps
- Service name

## Phase 2 Features (TODO)

The following services are scaffolded with TODO comments:

- **Recipe Service**: Recipe CRUD, reviews, cookbook generation
- **Event Service**: Event creation, RSVP, management
- **community Service**: Discussion threads, replies, moderation
- **Group Service**: Community groups, membership, moderation
- **Chat Service**: Real-time messaging with Socket.IO
- **News Service**: News feeds, author management

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod --dbpath /path/to/data`
- Check connection string in .env files

### Port Already in Use

- Kill process: `lsof -ti:3000 | xargs kill -9`
- Or change port in .env files

### Module Not Found Error

- Run `npm install` in all service directories
- Build libs: `cd libs && npm run build`

### Services Not Starting

- Check logs: `pm2 logs`
- Verify .env files exist and are configured
- Ensure MongoDB is accessible

## Development Tips

- Use `npm run dev` for hot-reloading during development
- Check health endpoints to verify services are running
- Use PM2 for production deployments
- Monitor logs for debugging

## Contributing

Phase 1 is complete with Auth and User services fully implemented. Phase 2 services are scaffolded and ready for implementation.

## License

MIT
