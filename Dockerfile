ARG NODE_TAG
FROM node:${NODE_TAG}

RUN mkdir /app
WORKDIR /app

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg curl cron procps

# prep work for gsutils
RUN curl -O https://packages.cloud.google.com/apt/doc/apt-key.gpg \
    && apt-key add apt-key.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# prep for postgres
RUN apt-get update && apt-get install -y lsb-release
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Set up init/backup utils
RUN apt-get update && apt-get install -y postgresql-client \
  wait-for-it google-cloud-sdk
RUN mkdir -p deploy-utils/data
WORKDIR /app/deploy-utils

# Backup
RUN mkdir data/backup
COPY deploy/utils/backup backup
COPY deploy/utils/backup/cron /etc/cron.d/backup
RUN chmod 0644 /etc/cron.d/backup

# Init
RUN mkdir data/init
COPY deploy/utils/init init

# Server dependencies
WORKDIR /app
COPY src/start-server.sh start-server.sh
COPY src/package.json package.json
COPY src/package-lock.json package-lock.json
RUN npm install

# Client dependencies
COPY src/client/package.json client/package.json
COPY src/client/package-lock.json client/package-lock.json
RUN cd client && npm install

# copy code
COPY src/api api
COPY src/lib lib
COPY src/index.js index.js
COPY src/client/build client/build
COPY src/client/js client/js
COPY src/client/public client/public
COPY src/client/scss client/scss

# client build
RUN cd client && npm run dist

# build tags
ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}
ARG BUILD_NUM
ENV BUILD_NUM ${BUILD_NUM}
ARG BUILD_TIME
ENV BUILD_TIME ${BUILD_TIME}

ENTRYPOINT [ "bash", "-c" ]
CMD ["echo 'Use command arg to specify a script to run.'"]
