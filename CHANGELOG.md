<!-- markdownlint-disable MD024 -->
# Tezori/Galleon Change Log

## 1.1.3

### New Features

- Initial public release of "Login with Tezori/Galleon".
- Preview pending operations from the mempool.
- Cancel delegation by setting the delegate value to blank.

### Fixes

- Updated various dependencies, notably upgraded to electron 8.3.0 and reduced the number of linked (non-dev) dependencies from 219 to 151.
- Corrected behavior of "use max" function on the send view.

## 1.1.2

### New Features

- Consolidated delegation workflow.
- Improved create new file wallet flow.
- Improved StakerDao token data rendering.
- Improved number localization.

## 1.1.1

### Fixes

- fixed T&C links
- defaulted to mainnet

## 1.1.0

Initial public release of the 1.x.x series of the Galleon Preview wallet for the Tezos blockchain. Galleon Preview is based on the "T2" codebase which is a rewrite of Tezori into Typescript. Numerous bugs were fixed along the way. The most significant new feature is the ability to support arbitrary contract UIs. This functionality is underlying the support for the three current tokens on Tezos: USDtz, StakerDAO and tzBTC.

## 1.0.x

There were several internal test releases to validate the Typescript migration.
