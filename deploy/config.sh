#! /bin/bash

######### DEPLOYMENT CONFIG ############
# Setup your application deployment here
########################################

# Grab build number is mounted in CI system
if [[ -f /config/.buildenv ]]; then
  source /config/.buildenv
else
  BUILD_NUM=-1
fi

# Main version number we are tagging the app with. Always update
# this when you cut a new version of the app!
APP_VERSION=v0.0.9.${BUILD_NUM}

# TODO: change to match name of your app
# This will be used to name the container image among other things
# So make it descriptive and unique
APP_SLUG=simple-spa

# App url and ports
APP_HOST=localhost:3000
APP_URL=http://$APP_HOST
APP_HOST_PORT=3000
APP_CONTAINER_PORT=3000

# Repository tags/branchs
# Tags should always be used for production deployments
# Branches can be used for development deployments
REPO_TAG=main

# Dependency tags/branches
# TODO: change these versions to match current LTS versions
NODE_TAG=18
POSTGRES_TAG=15.3
ADMINER_TAG=4.8.1 # for local dev only

# Container Registery
# TODO: decide whether to use public or private container registry
CONTAINER_REG_ORG=gcr.io/ucdlib-pubreg # public
CONTAINER_REG_ORG=gcr.io/digital-ucdavis-edu # private
if [[ ! -z $LOCAL_BUILD ]]; then
  CONTAINER_REG_ORG='localhost/local-dev'
fi

if [[ -z $REPO_TAG ]]; then
 CONTAINER_CACHE_TAG=$(git rev-parse --abbrev-ref HEAD)
else
 CONTAINER_CACHE_TAG=$REPO_TAG
fi

# This will be name of directory that contains local development docker compose file and env
LOCAL_DEV_DIRECTORY=$APP_SLUG-local-dev

# Container Images
APP_IMAGE_NAME=$CONTAINER_REG_ORG/$APP_SLUG
POSTGRES_IMAGE_NAME=postgres
ADMINER_IMAGE_NAME=adminer

APP_IMAGE_NAME_TAG=$APP_IMAGE_NAME:$REPO_TAG
POSTGRES_IMAGE_NAME_TAG=$POSTGRES_IMAGE_NAME:$POSTGRES_TAG
ADMINER_IMAGE_NAME_TAG=$ADMINER_IMAGE_NAME:$ADMINER_TAG

# Named Directories
DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$( cd $DEPLOY_DIR/.. && pwd )"
SRC_DIR=$ROOT_DIR/src
CLIENT_DIR=$SRC_DIR/client

# NPM
NPM=npm
NPM_PACKAGES=(
  $SRC_DIR
  $CLIENT_DIR
)
JS_BUNDLES=(
  $CLIENT_DIR
)

# TODO: If using init/backup utilities, set the following
# Google Cloud
GC_READER_KEY_SECRET="" # name of secret in secret manager for reading from bucket
GC_WRITER_KEY_SECRET="" # name of secret in secret manager for writing to bucket
GC_BACKUP_BUCKET="" # name of bucket that will be used for database backups
BACKUP_FILE_NAME="db.sql.gz"
# You may also need to set additional variables in your env file:
# RUN_INIT/INIT_DATA_ENV - used to hydrate db on startup
# RUN_BACKUP/BACKUP_DATA_ENV - used to backup db nightly
# And, you will need to get a service account key with ./cmds/get-reader-key.sh or ./cmds/get-writer-key.sh
