#!/bin/bash

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