# Use official Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the React app
RUN npm run build

# Install serve to host the build
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Serve the build
CMD ["serve", "-s", "build", "-l", "3000"]