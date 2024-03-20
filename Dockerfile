FROM node:18-alpine
WORKDIR /App.js

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

## Path: .dockerignore
#node_modules
#npm-debug.log
#```