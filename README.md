# Auth Service

## Overview

A robust authentication microservice built with NestJS, providing secure user authentication, authorization, and management.

## Key Features

- JWT-based authentication
- Role-based access control
- User registration and management
- Password hashing
- Validation and security middleware
- Internationalization support
- Comprehensive error handling

## Technology Stack

- NestJS
- Prisma ORM
- PostgreSQL
- Passport.js
- KafkaJS
- Sentry for error tracking
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- PostgreSQL
- Kafka

### Installation

```bash
# Install dependencies
$ yarn install

# Generate Prisma client
$ yarn prisma:generate

# Run database migrations
$ yarn prisma:migrate
```

## Running the Service

```bash
# Development mode
$ yarn dev

# Production mode
$ yarn start
```

## Database Management

```bash
# Generate Prisma schema
$ yarn prisma:generate

# Run database migrations (development)
$ yarn prisma:migrate

# Run database migrations (production)
$ yarn prisma:migrate:prod

# Open Prisma Studio
$ yarn prisma:studio
```

## Testing

```bash
# Run unit tests
$ yarn test

# Run end-to-end tests
$ yarn test:e2e

# Generate test coverage report
$ yarn test:cov
```

## Configuration

Configuration is managed through environment variables and NestJS ConfigModule.

Key configurations:

- Database connection
- JWT settings
- Kafka connection
- Sentry error tracking

## Security Features

- JWT authentication
- Password bcrypt hashing
- Input validation
- CORS protection
- Helmet middleware
- Rate limiting
- Compression

## Monitoring and Observability

- Sentry error tracking
- Swagger API documentation
- Health check endpoints
- Logging

## Development Workflow

1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Write tests
5. Run linting and formatting
6. Submit a pull request
