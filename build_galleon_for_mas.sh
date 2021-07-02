#!/bin/bash

# Release Cryptonomic's Galleon on the Mac App Store

#~~~ Install nodejs dependencies
npm install
cd ./src
npm install
cd ..

#~~~ Copy main.dev.js
cp ../Internal-infrastructure/deployments/prod/Galleon/assets/mas/main.dev.js ./src

#~~~ Build
npm run package

#~~~ Copies build fixes
cp ../Internal-infrastructure/deployments/prod/Galleon/build-mas.sh ./release/mas
cp ../Internal-infrastructure/deployments/prod/Galleon/assets/mas/child.plist ./release/mas
cp ../Internal-infrastructure/deployments/prod/Galleon/assets/mas/loginhelper.plist ./release/mas
cp ../Internal-infrastructure/deployments/prod/Galleon/assets/mas/parent.plist ./release/mas

#~~~ Run build mas
cd release/mas
bash build-mas.sh
