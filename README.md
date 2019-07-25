# T2
T, the next generation

## Both processes have to be started simultaneously in different console tabs:

npm run start-renderer-dev
npm run start-main-dev
This will start the application with hot-reload so you can instantly start developing your application.

## You can also run do the following to start both in a single process:

npm run start-dev

## Packaging
We use Electron builder to build and package the application. By default you can run the following to package for your current platform:

npm run dist
This will create a installer for your platform in the releases folder.

You can make builds for specific platforms (or multiple platforms) by using the options found here. E.g. building for all platforms (Windows, Mac, Linux):

npm run dist -- -mwl

## Docker image, container run
sudo make imageName="Your image name" run-container

## Docker container start/stop
sudo make containerId="container ID" start-container(stop-container)

## Dive Docker container
sudo make containerId="container ID" dive-container

## Start Jenkins server
sudo make containerId="container ID" jenkins-start

## Copy assets/config folder into container source
sudo make containerId="container ID" copy-assets
sudo make containerId="container ID" copy-config

## Build source in container from host machine or git
sudo make containerId="container ID" build-local
sudo make containerId="container ID" branch="branch name" build-git

## Jenkins Install to Linux
https://linuxize.com/post/how-to-install-jenkins-on-ubuntu-18-04/

## Execute Shell in Jenkins Build
set +e
chmod -R 777 /YOUR REPO
cd /YOUR REPO
git checkout -- .
git checkout master
git pull origin master
npm install
GH_TOKEN=(your github personal token) npm run dist -- -wl