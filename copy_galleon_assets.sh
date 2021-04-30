#!/bin/bash

# Copies assets for building Cryptonomic's Galleon deployment of the Tezori wallet.
# The assets are copied over from a private internal repo belonging to Cryptonomic.
# Cryptonomic developers should ensure that the internal repo is cloned in the same directory as T2.

cp ../Internal-infrastructure/deployments/prod/Galleon/assets/resources/background.png ./resources
cp ../Internal-infrastructure/deployments/prod/Galleon/assets/resources/background@2x.png ./resources
cp ../Internal-infrastructure/deployments/prod/Galleon/assets/resources/cryptonomicLogo.png ./resources
cp -R ../Internal-infrastructure/deployments/prod/Galleon/assets/resources/icons ./resources

cp ../Internal-infrastructure/deployments/prod/Galleon/assets/scripts/* ./scripts

cp ../Internal-infrastructure/deployments/prod/Galleon/assets/src/config.json ./src
cp ../Internal-infrastructure/deployments/prod/Galleon/assets/src/main.dev.js ./src
cp -R ../Internal-infrastructure/deployments/prod/Galleon/assets/src/extraResources ./src/extraResources