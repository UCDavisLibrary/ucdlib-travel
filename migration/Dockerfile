FROM localhost/local-dev/ucdlib-travel:dev

WORKDIR /app

RUN cd /app && npm link
ENV NODE_PATH /usr/local/lib/node_modules/
WORKDIR /migration

COPY package*.json ./

RUN npm install

# Install the Node.js dependencies
RUN npm link @ucd-lib/travel-app-server
