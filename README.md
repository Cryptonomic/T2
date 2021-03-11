# Tezori (T2)

A wallet for the Tezos blockchain based on [ConseilJS](https://github.com/Cryptonomic/ConseilJS). T2 is a rewrite of the original [Tezori codebase](https://github.com/Cryptonomic/Tezori) into Typescript. Along the way we re-architected to code to make it more resilient and extensible. The wallet uses ConseilJS to interact with the Tezos blockchain for operation submission and with the Conseil indexer for fast aggregated data, like the full list of transactions for an account, or the collection of contracts a given account has deployed. ConseilJS also provides a software signer and a Ledger device interface for increased security.

This product was written for the community – fork it, hack it, use it as you please!

[![Build Status](https://travis-ci.org/Cryptonomic/T2.svg?branch=trunk)](https://travis-ci.org/Cryptonomic/T2)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/T2/badge.svg?branch=trunk)](https://coveralls.io/github/Cryptonomic/T2?branch=trunk)

## Development

### Building

The wallet is built with Typescript, React and Electron. [Cryptonomic](https://cryptonomic.tech/) offers a deployment of Tezori called [Galleon](https://cryptonomic.tech/galleon.html).

To build your own package add the environment configuration file as `src/extraResources/walletSettings.json`. Cryptonomic uses the [Nautilus Cloud](https://nautilus.cloud/) infrastructure of Tezos and [Conseil indexer](https://github.com/Cryptonomic/Conseil) nodes for production deployments.

Note the version of nodejs specified in the outer [package file](https://github.com/Cryptonomic/T2/blob/trunk/package.json), at the time of writing it was **12.21.0**. We recommend using [nvm](https://github.com/nvm-sh/nvm).

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

`npm i`

To run during development:

`npm run dev`

To package for deployment for the local target:

`npm run package`

A complete script might look like this:

```bash
nvm use 12.21.0

mkdir ./t2
cd t2

git clone https://github.com/Cryptonomic/T2.git .
npm i
npm run dev
```

### Customization Options

Several branding features can be applied in `src/config.json`, including name, logo and block explorer link.

### Contributing

We welcome all contributions, be it issue reports, feature suggestions, [language files](https://github.com/Cryptonomic/T2/tree/master/src/locales) or pull requests. When submitting a PR expect the code to undergo a detailed review prior to any potential inclusion.

## Support

Cryptonomic hosts a [developer support channel](https://matrix.to/#/!heGqMNcsOSHGPxrMJs:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=tzchat.org) on [Element](https://element.io/). Cryptonomic and several of its employees are active on Reddit and [Twitter](https://twitter.com/cryptonomictech).

[ConseilJS documentation](https://cryptonomic.github.io/ConseilJS/) and [Conseil documentation](https://github.com/Cryptonomic/Conseil/wiki) is quite through as well.

## Architecture Overview

_This section may be occasionally outdated as the codebase evolves._

One of the goals for the T2 rewrite of Tezori was to organize the code in a clearer way. Here's an outline of the directory structure.

- `components` – Reusable components, these are customized React and material-ui elements that perform common functions, like [value entry](NumericEntry).
- constants
- `containers` – Application views, compositions of components for the primary application window.
- `contracts` – Contract-specific interfaces. These components are meant to be isolated if necessary, especially early in the development cycle to reduce the impact of new functionality on the existing application.
- customHooks
- `extraResources` - Contains wallet settings.
- `featureModals` – Functional pop-up that contain significant interactive functionality like deploying contracts and signing messages.
- `locales` – language files.
- `reduxContent` – actions, thunks, reducers, and various other Redux conventional bits to manage state and hook up application events.
- store
- styles
- types
- utils

The main application entry point is `app.html`.

## Known Issues

There are several opportunities for improvement that we're tackling during the normal process of adding new functionality to the application. There include, but are not limited to:

- Documentation
- Removing duplicate code & components.
- Removing duplicate styles.
- Reducing direct dependencies.
- Consolidating like utilities.

There are `TODO` items sprinkled around the code and of course the formal [list of issues](https://github.com/Cryptonomic/T2/issues).
