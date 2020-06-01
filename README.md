# Tezori

A wallet for the Tezos blockchain based on [Conseil](https://github.com/Cryptonomic/Conseil) and [ConseilJS](https://github.com/Cryptonomic/ConseilJS).

This code was written for the community. Use it, hack it, fork it as you please!

[![Build Status](https://travis-ci.org/Cryptonomic/Tezori.svg?branch=master)](https://travis-ci.org/Cryptonomic/Tezori)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/Tezori/badge.svg?branch=master)](https://coveralls.io/github/Cryptonomic/Tezori?branch=master)

## Development

The wallet is built on [React](https://reactjs.org/) and [Electron](https://electronjs.org/) and uses [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate).

Active development happens on the develop branch with periodic merges to master.

Add the file `src/extraResources/walletSettings.json`:

```json
{
  "selectedNode": "MyTezosNode",
  "nodesList": [
    {
      "displayName": "MyTezosNode",
      "platform": "TEZOS",
      "network": "MyNetwork",
      "tezosUrl": "https://mytezosnode.com",
      "conseilUrl": "https://myconseilnode.com",
      "apiKey": "anapikey"
    }
  ],
  "selectedPath": "Default",
  "pathsList": [
    {
      "label": "Default",
      "derivation": "44'/1729'/0'/0'/0'"
    }
  ]
}
```

To install all dependencies:

```bash
npm i
cd src
npm i
cd ..
```

To run during development:

`npm run dev`

To package for deployment for the local target:

`npm run package`

## Customize Logo

Change the `tezosLogo.svg` file in `resources/` folder.

Change the `logo` field in `src/config.json`.
