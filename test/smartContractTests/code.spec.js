const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const { sleepApp } = require('../utils/sleepApp');
const CodePage = require('../pages/codePage');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

// describe('Smart Contract Code feature test: ', function () {
//     this.timeout(500000);

//     const app = new Application({
//         path: electronBinary,
//         args: [baseDir],
//         env: {
//             WEB_CLIENT: 'spectron',
//         },
//     });

//     // page object
//     const codePage = new CodePage(app);

//     // beforeEach(async () => {
//     //     await app.start();
//     //     await codePage.selectLanguageAndAgreeToTerms();
//     //     await codePage.setTestNode();
//     //     await codePage.openExistingWallet(process.env.TZ1_PASSWORD);
//     // });

//     // afterEach(() => app.stop());

//     // it('correct data are visible in storage section', async () => {
//     //     const correctCodeConent = 'parameter string;\nstorage string;\ncode { CAR ;\n       NIL operation ;\n       PAIR }';

//     //     await codePage.openSmartContract(1);
//     //     await codePage.navigateToSection('Code');
//     //     const codeContent = await codePage.retrieveCodeContent();
//     //     assert.equal(codeContent, correctCodeConent, `code content is wrong: ${codeContent} should be ${correctCodeConent}`);
//     // });
// });
