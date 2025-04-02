#! /bin/bash

###
# Installs npm packages and generates dev js bundles for site - aka watch process without the watch
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$( cd $CMDS_DIR/../.. && pwd )"

${CMDS_DIR}/subset-icons.sh

echo "Installing npm packages..."
cd $ROOT_DIR/src/client
npm i

echo "Generating dev js bundles..."
npm run create-dev-bundle
