FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Install PostgreSQL and MySQL clients
RUN apt-get update && apt-get install -y \
    postgresql-client \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code
COPY migrations-app/ ./migrations-app

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]