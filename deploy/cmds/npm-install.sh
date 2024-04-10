#! /bin/bash

###
# Installs dependencies for all NPM packages in repo
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/..

source ./config.sh

for package in "${NPM_PACKAGES[@]}"; do
  (cd $package && $NPM i)
done
