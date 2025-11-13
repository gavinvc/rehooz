# Use official Node image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port that `npm start` uses (usually 3000)
EXPOSE 3000

# Run the app
CMD ["npm", "start"]

