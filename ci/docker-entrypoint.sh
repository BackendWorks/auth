#!/bin/sh

# Run database migrations
echo "Running database migrations..."
yarn prisma:migrate-prod

# Start the application
echo "Starting the application..."
exec yarn start
