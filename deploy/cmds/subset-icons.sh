#! /bin/bash

###
# Create a subset of the icons for the app.
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../..

node ./src/lib/subsetIcons.js
