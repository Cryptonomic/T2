# Spectron e2e test of T2 application

This folder contains tests scripts, plugins, and other support files which can be executed
by test framework spectron.io.

## Installation

Before launching tests make sure that:

1. All dependencies are installed.

```bash
npm install
```

1. You have got files with sensitive data placed in the `walletsData` folder:

-   testing.tezwallet
-   testConfig.json

```json
{
    "fileName": "testing.tezwallet",
    "address": "",
    "password": "",
    "signatureMessage": "",
    "correctSignature": "",
    "incorrectSignature": "",
    "tokenName": "",
    "tokenSymbol": "",
    "tokenAddress": "",
    "tokenDestination": "",
    "tokenAmount": 1,
    "tokenToContract": ""
}
```

1. Production version of the application was built:

```bash
npm run test-build
```

## Usage

Tests are launch a product version of the application.
To launch all test, simply run:

```bash
npm run test
```

If you want to launch specific tests, open package.json, and add the relative path of the selected test suite file in npm:test command as mocha's param.

## Project structure

-   Basic files and dirs:

1. Tests that are focused around the specific subjects (e.g. Implicit Account) are placed in folders or
   they just left in the main folders (e.g. Sign and Verify)
1. All \*.spec.js files are tests suits that focus around concrete feature ( for example SEND feature)
1. test/pages -> those files include page objects (design patterns) which are helpful to maintain tests
   clean and readable; in each folder, we can find functions that control basic features of each app section and main selectors. Pages objects are share between for example Implicit Account section and Babylon Delegation Section. All pages inherit from the base page where we can find the most fundamental methods of the Spectron rewrite in a more readable way and the application itself ( e.g refreshing app)
1. test/utils -> there is only one function to stop the app for a certain time during tests

-   Files and folders with sensitive data:
    -   walletsData (folder)
    -   testConfig.json (file)
    -   wallet (file)
-   Without those files, tests will not work.

## Problems and challenges

1. We are using an older version of Electron and due to this fact, old version of the Spectron (10), therefor some
   Spectron's features are not available
1. E2E tests are quite slow because in some tests we have to wait until T2 finished previous operations and get information from 3rd part services.
1. Some tests are skip because, during the design process, we've found and reported bugs in the application, related to them.

## Spectron documentation

[spectron](https://www.electronjs.org/spectron)
