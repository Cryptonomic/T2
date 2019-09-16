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
1. sudo make containerId="container ID" copy-assets
2. sudo make containerId="container ID" copy-config

## Install Wine32/64 to Ubuntu docker container to build Window version
1. apt-get install wine64
2. dpkg --add-architecture i386 && apt-get update && apt-get install wine32

## Build source in container from host machine or git
1. sudo make containerId="container ID" build-local
2. sudo make containerId="container ID" branch="branch name" build-git

## Jenkins Install to Linux
https://linuxize.com/post/how-to-install-jenkins-on-ubuntu-18-04/

## Execute Shell in Jenkins Build

1. set +e
2. chmod -R 777 /YOUR REPO
3. cd /YOUR REPO
4. git checkout -- .
5. git checkout master
6. git pull origin master
7. npm install
8. GH_TOKEN=(your github personal token) npm run dist -- -wl

## Reference

https://www.npmjs.com/package/electron-store