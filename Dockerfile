# Use the official Node.js image
FROM node:22.16.0-bullseye

# Set working directory
WORKDIR /app

# Install Playwright dependencies
RUN apt-get update && \
    apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libwayland-client0

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright
RUN npx playwright install --with-deps

# Copy application code
COPY . .

# Expose the port your app uses
EXPOSE 3000

# Start command
CMD ["npm", "start"]