#! /bin/bash

###
# Do the basic setup for local development
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/..

source ./config.sh

./cmds/npm-install.sh
./cmds/generate-dev-bundles.sh

touch ../gc-writer-key.json
touch ../gc-reader-key.json
