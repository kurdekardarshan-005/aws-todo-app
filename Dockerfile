# Start from the official Node.js 20 image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install the app's dependencies (now including express)
RUN npm install

# Copy the rest of your app's code (app.js AND the 'public' folder)
COPY . .

# Tell Docker the app will listen on port 3000
EXPOSE 3000

# The command to run when the container starts
CMD ["node", "app.js"]
