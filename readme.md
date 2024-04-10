# UCDLIB Travel APP

TODO: DOCUMENTATION

This template is for a [cork-app-utils](https://github.com/UCDavisLibrary/cork-app-utils) SPA with an Express server without any dependencies on other repositories.

It uses 
 - ucdlib-theme for SPA themed elements
 - Postgres for a database
 - Google Cloud for devops procedures such as building, backup, and data initialization
 - OIDC (keycloak) for auth

## Setup

To use this template when starting your own application:
1. Clone/checkout this repo.
2. `cp -R ./simple-spa path/to/your/app`
3. Search for `TODO:` in the project, and follow corresponding instructions
4. Follow the Local Development section below to get your app up and running.
5. Clean up your repository... replace this readme, delete todos, etc.
6. When setting your production env file, make sure to include the [COMPOSE_PROJECT_NAME](https://docs.docker.com/compose/environment-variables/envvars/#compose_project_name) variable. Otherwise, your services will have generic names like `deploy-db-1`. You could also change the name of the deploy directory.


## Directory Structure

```yaml
deploy:
  desc: Scripts for building/deploying app on your local machine and/or a server
  items:
    - cmds: Deploy/devops scripts
    - db-entrypoint: SQL files that run on container start if db is empty
    - templates: Handlebar-style templates of deployment files
    - utils: Deployment utilities, such as data init and backup

src:
  desc: Application source code
  items:
    - api:
        desc: Server-side source code. JSON data endpoints to be consumed by cork-app-utils services.
    - client:
        desc: Browser-side source code
        items:
          - build: Config files for webpack assets build
          - public: Static asset directory. Everything here will be served. index.html is where the SPA code will be loaded
          - scss: SCSS source code. By default, loads ucdlib theme.
          - js: JS source code - Lit pages and components.
    - lib:
        desc: Code imported and used by the browser or server endpoints
        items:
          - cork: cork-app-utils models, services, and stores.
          - db-models: Models for interacting with database. In general, each model will correspond with a table.
          - utils: Any shared code.
    - index.js: Entry point for application.
```

## Local Development

To get the app up and running on your machine:

1. `cd deploy`
2. `./cmds/init-local-dev.sh`
3. `./cmds/build-local-dev.sh`
4. `./cmds/generate-deployment-files.sh`
5. A directory called `$APP_SLUG-local-dev` will have been created.
6. Enter it, and run `docker compose up`

To start the JS/SCSS watch process run `cd src/client && npm run watch`

## Backup/Init Utilities

This project comes with optional utilities that:
1. Every night, exports a database dump file and pushes it to a designated Google Cloud Bucket
2. Upon container start, fetches this dump file and hyrdates the database if it is empty.

To set these up, you will need to:
1. Create or use an existing Google Cloud Bucket, and then assign it to the `GC_BACKUP_BUCKET` variable in config.sh. This is required for both the init and backup utilities.
2. Create a service account that can *read* from the bucket, and then save its json key as a Google Cloud Secret. The secret name should be assigned to the `GC_READER_KEY_SECRET` variable in config.sh. This is required for the init utility.
3. Create a service account that can *write* to the bucket, and then save its json key as a Google Cloud Secret. The secret name should be assigned to the `GC_WRITER_KEY_SECRET` variable in config.sh. This is required for the backup utility.
4. Follow any additional instructions in the Google Cloud section of config.sh.
# ucdlib-travel
