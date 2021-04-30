#!/bin/bash

# Builds Cryptonomic's Galleon deployment of the Tezori wallet
# Cryptonomic developers should ensure that they have already run copy_galleon_assets.sh
# Set the $GALLEON_VERSION environment variable as appropriate.

#~~~ Install nodejs dependencies
npm i
cd ./src
npm i
cd ..

#~~~ Build
npm run package
cd release
md5sum galleon_${GALLEON_VERSION}-beta_amd64.snap > galleon_${GALLEON_VERSION}-beta_amd64.snap.md5
sha1sum galleon_${GALLEON_VERSION}-beta_amd64.snap > galleon_${GALLEON_VERSION}-beta_amd64.snap.sha1
md5sum galleon_${GALLEON_VERSION}-beta_amd64.deb > galleon_${GALLEON_VERSION}-beta_amd64.deb.md5
sha1sum galleon_${GALLEON_VERSION}-beta_amd64.deb > galleon_${GALLEON_VERSION}-beta_amd64.deb.sha1
cd ..