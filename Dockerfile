# Use Node official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build the React app
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose Cloud Run port
EXPOSE 8080

# Use the environment variable $PORT
CMD ["serve", "-s", "build", "-l", "8080"]
