#! /bin/bash

source /etc/profile
DATA_DIR=/app/deploy-utils/data/backup

if [[ -z $BACKUP_DATA_ENV ]]; then
  echo "BACKUP_DATA_ENV variable is required."
  exit 1
fi

# dump pg data
echo "Generating sqldump file"
pg_dump | gzip > $DATA_DIR/$BACKUP_FILE_NAME

echo "uploading files to cloud bucket ${BACKUP_DATA_ENV}"
gcloud auth login --quiet --cred-file=${GOOGLE_APPLICATION_CREDENTIALS}
gsutil cp $DATA_DIR/$BACKUP_FILE_NAME "gs://${GC_BACKUP_BUCKET}/${BACKUP_DATA_ENV}/${BACKUP_FILE_NAME}"

rm $DATA_DIR/$BACKUP_FILE_NAME

echo "backup complete"
