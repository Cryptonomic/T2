const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const fakeDialog = require('spectron-fake-dialog');
const { electron } = require('process');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

// utility functions
const sleep = (time) => new Promise((r) => setTimeout(r, time));

describe('Test', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
    });
    fakeDialog.apply(app);

    before(() =>
        app.start().then(() => {
            fakeDialog.mock([{ method: 'showOpenDialog', value: ['tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW.tezwallet'] }]);
        })
    );
    after(() => app.stop());

    it('first test', async () => {
        const count = await app.client.getWindowCount();
        assert.equal(count, 1);
        const header = await app.client.getText('h1.sc-pYZcj');
        assert.equal(header, 'Tezori');
        // await sleep(3000);
        await app.client.click('button=Continue');
        // await sleep(3000);
        await app.client.click('button=I Agree');
        // await sleep(3000);
        await app.client.click('#settingsButton');
        // await sleep(3000);
        await app.client.click('#settingsTestNodeButton');
        await app.client.click('div=Tezos Testnet (nautilus.cloud)');
        await app.client.click('span=Back to Login');
        // await sleep(3000);
        await app.client.click('span=Open Existing Wallet');
        // await app.client.click('span=Select Wallet File');
        // const filePath = '/Users/jacekwalczak/Documents/GitHub/T2/test/tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW.tezwallet';
        // await app.client.chooseFile(
        // 	'#test button',
        // 	'/Users/jacekwalczak/Documents/GitHub/T2/test/tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW.tezwallet'
        // );
        // const remoteFilePath = await app.client.uploadFile(filePath);
        await app.client.click('#test button');
    });
});
