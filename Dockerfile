FROM node:20

RUN mkdir /app
WORKDIR /app

RUN apt-get update && apt-get install -y \
  apt-transport-https \
  ca-certificates \
  gnupg \
  curl \
  cron \
  lsb-release \
  vim \
  procps

# Prep work for gsutil
RUN install -d -m 0755 /etc/apt/keyrings \
 && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \
  | gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg \
 && chmod 0644 /etc/apt/keyrings/cloud.google.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
  > /etc/apt/sources.list.d/google-cloud-sdk.list

# prep for postgres
RUN install -d -m 0755 /etc/apt/keyrings \
 && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg \
 && chmod 0644 /etc/apt/keyrings/postgresql.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] \
  http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list

# Set up init/backup utils
RUN apt-get update && apt-get install -y \
  postgresql-client \
  wait-for-it \
  google-cloud-sdk
RUN mkdir -p deploy-utils/data
WORKDIR /app/deploy-utils

# Backup
RUN mkdir data/backup
COPY utils/backup backup
COPY utils/backup/cron /etc/cron.d/backup
RUN chmod 0644 /etc/cron.d/backup

# Init
RUN mkdir data/init
COPY utils/init init

# uploads volume
RUN mkdir /uploads

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

# subset icons
RUN node lib/subsetIcons.js

# client build
RUN cd client && npm run dist

ENTRYPOINT [ "bash", "-c" ]
CMD ["echo 'Use command arg to specify a script to run.'"]
