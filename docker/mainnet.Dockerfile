# Use an official Node.js runtime as the base image
FROM node:lts-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .
COPY --chmod=755 docker/start /usr/local/bin/start

# Build the Next.js app
RUN npm run codegen
RUN npm run build

# create-testnet and deploy-testnet reuire access to the graph node and ipfs
ENTRYPOINT ["start", "mainnet"]
