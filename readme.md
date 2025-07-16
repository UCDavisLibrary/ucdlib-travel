# UC Davis Library Travel, Training, and Professional Development Approval Application

Allows UC Davis library staff to submit travel, training, and professional development requests for approval by concerned parties (supervisor, department head, etc)

## Local Development

To get the app up and running on your machine:

To get this application up and running for the first time:
1. Clone this repository
2. Checkout the branch you want to work on.
3. Run `./deploy/cmds/init-local-dev.sh` to download gc key, env, and build js
4. Review the env file downloaded to `./deploy/compose/ucdlib-travel-local-dev`
5. Run `./deploy/cmds/build-local-dev.sh` to build images
6. Enter `./deploy/compose/ucdlib-travel-local-dev`, and run `docker compose up -d`
7. Run `docker compose exec app bash -c './start-server.sh'` to start the server

To start the JS/SCSS watch process run `cd src/client && npm run watch`

## Production Deployment

On your machine:

- Submit PR to main, merge, pull, tag, and push
- Update production compose.yaml file with new tag
- Update the cork-build-registry with your new tag
- Build images with with deploy/cmds/build.sh <tag>

On the production server (currently veers.library)

- cd /opt/ucdlib-travel/deploy/ucdlib-travel-prod and git pull
- docker compose pull to download images from Google Cloud
- docker compose down then docker compose up -d

There will be a brief service outage as the containers start up, so try to schedule deployents accordingly. If something goes wrong, you can always revert to the previously tagged images.

