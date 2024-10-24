#! /bin/bash

###
# Main build process to cutting production images
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/..
source config.sh

# Use buildkit to speedup local builds
# Not supported in google cloud build yet
if [[ -z $CLOUD_BUILD ]]; then
  export DOCKER_BUILDKIT=1
fi

# Application with init/backup utilities
docker build \
  -t $APP_IMAGE_NAME_TAG \
  --cache-from=$APP_IMAGE_NAME:$CONTAINER_CACHE_TAG \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --build-arg NODE_TAG=${NODE_TAG} \
  --build-arg BUILD_NUM=${BUILD_NUM} \
  --build-arg BUILD_TIME=${BUILD_TIME} \
  --build-arg APP_VERSION=${APP_VERSION} \
  $ROOT_DIR
