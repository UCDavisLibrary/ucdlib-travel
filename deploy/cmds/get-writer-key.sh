#! /bin/bash

###
# download the writer key from the secret manager
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR/../..

gcloud secrets versions access latest --secret=$GC_WRITER_KEY_SECRET > gc-writer-key.json
