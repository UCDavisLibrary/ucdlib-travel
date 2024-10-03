# FROM node:16
FROM localhost/local-dev/ucdlib-travel:dev

WORKDIR /app

RUN cd /app && npm link
ENV NODE_PATH /usr/local/lib/node_modules/
WORKDIR /migration

# Copy the rest of the application code
# COPY ./src ./src

# Copy the package.json and package-lock.json files
COPY package*.json ./
# COPY wait-for-it.sh ./

# RUN chmod +x ./wait-for-it.sh


RUN npm install

# Install the Node.js dependencies
RUN npm link @ucd-lib/travel-app-server

# ARG MYSQL_HOST

# Expose the port the app runs on
# EXPOSE 5432

# Command to run the application
# RUN node src/index.js