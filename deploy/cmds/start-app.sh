#! /bin/bash

###
# Start local dev application (docker cluster must be running)
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR

cd ../compose/ucdlib-travel-local-dev && \
docker compose exec app bash -c './start-server.sh'
