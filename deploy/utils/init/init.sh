#! /bin/bash

DATA_DIR=/app/deploy-utils/data/init

# wait for db to start up
echo "Waiting for db to start up"
wait-for-it $PGHOST:$PGPORT -t 0

if [[ -z "$RUN_INIT" || -z "$INIT_DATA_ENV" ]]; then
  echo "Skipping db hydration.";
  if [[ -z "$RUN_INIT" ]]; then
    echo "No RUN_INIT flag found."
  else
    echo "INIT_DATA_ENV environmental variable is not set."
  fi
else
  # check that postgres has tables
  echo "Checking if db has tables"
  DB_HAS_DATA=$(echo "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'cache');" | psql -t | xargs)
  if [[ $DB_HAS_DATA == 'f' ]]; then
    echo "No data found in db, attempting to pull content for google cloud bucket"
    gcloud auth login --quiet --cred-file=${GOOGLE_APPLICATION_CREDENTIALS}
    echo "Downloading: gs://${GC_BACKUP_BUCKET}/${INIT_DATA_ENV}/${BACKUP_FILE_NAME}"
    gsutil cp "gs://${GC_BACKUP_BUCKET}/${INIT_DATA_ENV}/${BACKUP_FILE_NAME}" $DATA_DIR/$BACKUP_FILE_NAME
    echo "hydrating db from sqldump"
    gunzip -c $DATA_DIR/$BACKUP_FILE_NAME | psql
    rm $DATA_DIR/$BACKUP_FILE_NAME
    echo "db hydration complete"
  else
    echo "Tables found in db. Skipping hydration."
  fi

  # check if need to hydrate uploads directory
  UPLOADS_FILE_COUNT=$(ls -1q '/uploads' | wc -l)
  if [[ $UPLOADS_FILE_COUNT -eq 0 ]]; then
    echo "No files found in uploads directory. Hydrating uploads directory."
    GC_UPLOADS_SOURCE="gs://${GC_BACKUP_BUCKET}/${INIT_DATA_ENV}/uploads.tar.gz"
    gcloud auth login --quiet --cred-file=${GOOGLE_APPLICATION_CREDENTIALS}
    if gsutil stat "$GC_UPLOADS_SOURCE" >/dev/null 2>&1; then
      echo "Downloading: $GC_UPLOADS_SOURCE"
      gsutil cp "$GC_UPLOADS_SOURCE" $DATA_DIR/uploads.tar.gz
    else
      echo "Error: $GC_UPLOADS_SOURCE does not exist"
      exit 1
    fi
    echo "Extracting uploads directory"
    tar -xzvf $DATA_DIR/uploads.tar.gz -C /
    rm $DATA_DIR/uploads.tar.gz
    echo "Uploads directory hydration complete"
  else
    echo "Files found in uploads directory. Skipping hydration."
  fi

fi
echo "Init container is finished and exiting (this is supposed to happen)"
