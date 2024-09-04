FROM node:16

# Set the working directory inside the container
WORKDIR /app


# Install PostgreSQL and MySQL clients
# RUN apt-get update && apt-get install -y \
#     postgresql-client \
#     default-mysql-client \
#     && rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y postgresql-client

RUN apt-get update && apt-get install -y default-mysql-client

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install


# Copy the rest of the application code
COPY migration-app/ ./migration-app

WORKDIR /app/migration-app


# Expose the port the app runs on
EXPOSE 5000


# Command to run the application
# CMD ["npm", "start"]