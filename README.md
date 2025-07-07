# Auth Service

A microservice for handling user authentication and authorization in the NestJS microservices architecture.

## 🚀 Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **User Management**: CRUD operations for user accounts
- **Role-based Authorization**: Support for ADMIN and USER roles
- **gRPC Microservice**: Inter-service communication via gRPC
- **REST API**: HTTP endpoints for authentication operations
- **Database Integration**: PostgreSQL with Prisma ORM
- **Caching**: Redis-based caching for performance
- **Internationalization**: Multi-language support with nestjs-i18n
- **API Documentation**: Swagger/OpenAPI documentation
- **Health Checks**: Built-in health monitoring
- **Security**: Helmet security headers, CORS configuration

## 🏗️ Architecture

### Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with cache-manager
- **Authentication**: JWT with Passport.js
- **API Documentation**: Swagger/OpenAPI
- **Microservice**: gRPC communication
- **Validation**: class-validator and class-transformer
- **Testing**: Jest

### Service Structure

```
src/
├── app/                    # Application bootstrap
├── common/                 # Shared modules and utilities
│   ├── config/            # Configuration management
│   ├── constants/         # Application constants
│   ├── decorators/        # Custom decorators
│   ├── dtos/             # Data Transfer Objects
│   ├── filters/          # Exception filters
│   ├── guards/           # Authentication guards
│   ├── interceptors/     # Response interceptors
│   ├── interfaces/       # TypeScript interfaces
│   ├── middlewares/      # Request middlewares
│   ├── providers/        # JWT strategies
│   └── services/         # Shared services
├── generated/            # gRPC generated code
├── languages/            # i18n translation files
├── modules/             # Feature modules
│   ├── auth/            # Authentication module
│   └── user/            # User management module
└── protos/              # gRPC protocol buffers
```

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL
- Redis

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` and `.env.docker` files with the following variables:
   ```env
   # App Configuration
   NODE_ENV=development
   APP_NAME=NestJS Auth Service
   APP_DEBUG=false
   APP_CORS_ORIGINS=http://localhost:3000

   # HTTP Configuration
   HTTP_ENABLE=true
   HTTP_HOST=0.0.0.0
   HTTP_PORT=9001
   HTTP_VERSIONING_ENABLE=false
   HTTP_VERSION=1

   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/auth_db

   # JWT Configuration
   ACCESS_TOKEN_SECRET_KEY=your-access-token-secret-key-min-32-chars
   ACCESS_TOKEN_EXPIRED=15m
   REFRESH_TOKEN_SECRET_KEY=your-refresh-token-secret-key-min-32-chars
   REFRESH_TOKEN_EXPIRED=7d

   # Redis Configuration
   REDIS_URL=redis://localhost:6379
   REDIS_KEY_PREFIX=auth:
   REDIS_TTL=3600

   # gRPC Configuration
   GRPC_URL=0.0.0.0:50051
   GRPC_PACKAGE=auth

   # Monitoring (Optional)
   SENTRY_DSN=your-sentry-dsn
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate

   # (Optional) Open Prisma Studio
   npm run prisma:studio
   ```

5. **Generate gRPC code**
   ```bash
   npm run proto:generate
   ```

## 🚀 Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Docker (if available)
```bash
docker build -t auth-service .
docker run -p 9001:9001 auth-service
```

## 📡 API Endpoints

### Authentication Endpoints

#### Public Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

#### Protected Endpoints
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/logout` - User logout

### User Management Endpoints

#### Admin Only
- `GET /admin/users` - List all users (paginated)
- `GET /admin/users/:id` - Get user by ID
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Health Check
- `GET /health` - Service health status
- `GET /` - Service information

## 🔌 gRPC Services

### AuthService
- `ValidateToken` - Validate JWT tokens and return user information

## 🗄️ Database Schema

### User Model
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  avatar VARCHAR,
  is_verified BOOLEAN DEFAULT false,
  phone_number VARCHAR,
  role Role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

### Role Enum
```sql
CREATE TYPE Role AS ENUM ('ADMIN', 'USER');
```

## 🔧 Configuration

The service uses a modular configuration system with environment-specific settings:

### App Configuration
- **Name**: Service name and display information
- **Environment**: Development, staging, production
- **Debug**: Debug mode settings
- **CORS**: Cross-origin resource sharing settings

### HTTP Configuration
- **Port**: HTTP server port (default: 9001)
- **Host**: HTTP server host
- **Versioning**: API versioning settings

### JWT Configuration
- **Access Token**: Secret key and expiration time
- **Refresh Token**: Secret key and expiration time

### Database Configuration
- **URL**: PostgreSQL connection string
- **Migrations**: Database migration settings

### Redis Configuration
- **URL**: Redis connection string
- **Key Prefix**: Cache key prefix
- **TTL**: Cache time-to-live

### gRPC Configuration
- **URL**: gRPC server address
- **Package**: Protocol buffer package name

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## 📚 API Documentation

When running in development mode, Swagger documentation is available at:
```
http://localhost:9001/docs
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password hashing
- **Role-based Access Control**: ADMIN and USER roles
- **Helmet Security**: Security headers
- **CORS Protection**: Cross-origin request protection
- **Input Validation**: Request validation with class-validator
- **Rate Limiting**: Built-in rate limiting (configurable)

## 📊 Monitoring

- **Health Checks**: Built-in health monitoring endpoints
- **Sentry Integration**: Error tracking and monitoring
- **Logging**: Structured logging with Winston
- **Metrics**: Performance metrics collection

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in your deployment environment.

### Database Migrations
Run database migrations before starting the service:
```bash
npm run prisma:migrate:prod
```

### Health Checks
The service provides health check endpoints for load balancers and monitoring systems.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
