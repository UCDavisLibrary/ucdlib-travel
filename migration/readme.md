# Migration
This script migrates data from the [old bigsys application](https://bigsys.lib.ucdavis.edu/travel/index.php) into this application. For simplicity's sake, if an employee is no longer employed at the UC Davis Library, we do not attempt to transfer those records.

1. Create `db-entrypoint` directory in this directory.
2. Download `gs://itis-backups/travel/bigsys/db1_lib_ucdavis_edu.sql.zip` into that directory
3. Unzip the data file
4. Copy main local dev `env` into the `migration` directory
5. Ensure main docker cluster images are up to date
6. In local main docker compose file, publish port of db service to `5432`
7. Start main docker cluster
8. Using the application GUI, add Elizabeth to the "finance head" approver type
9.  In `migration` run `docker compose up -d`
10. `docker compose exec migrate bash`
11. `node index.js --year=2024`
