# T2
T, the next generation

#Both processes have to be started simultaneously in different console tabs:

npm run start-renderer-dev
npm run start-main-dev
This will start the application with hot-reload so you can instantly start developing your application.

#You can also run do the following to start both in a single process:

npm run start-dev

#Packaging
We use Electron builder to build and package the application. By default you can run the following to package for your current platform:

npm run dist
This will create a installer for your platform in the releases folder.

You can make builds for specific platforms (or multiple platforms) by using the options found here. E.g. building for all platforms (Windows, Mac, Linux):

npm run dist -- -mwl