const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');

const { sleepApp } = require('../utils/sleepApp');

const DelegatePage = require('../pages/delegatePage');
const TransactionPage = require('../pages/transactionPage');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Implicit account Delegation tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const delegatePage = new DelegatePage(app);
    const transactionPage = new TransactionPage(app);

    beforeEach(async () => {
        await app.start();
        await delegatePage.selectLanguageAndAgreeToTerms();
        await delegatePage.setTestNode();
        await delegatePage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('change baker address happy path', async function () {
        // check if all transaction are finshed
        await delegatePage.navigateToSection('Transactions');
        await transactionPage.waitUntilPendingTransactionFinished();

        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        const bakerAddress = await delegatePage.retrieveDelegateToAddres();
        if (bakerAddress) {
            if (bakerAddress === 'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9') {
                await delegatePage.changeBakerAddress({
                    bakerAddress: 'tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf',
                    feeLevel: 'High',
                    walletPassword: process.env.TZ1_PASSWORD,
                    send: true,
                });
            } else {
                await delegatePage.changeBakerAddress({
                    bakerAddress: 'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9',
                    feeLevel: 'Low',
                    walletPassword: process.env.TZ1_PASSWORD,
                    send: true,
                });
            }
            await delegatePage.assertPopUpAlert('Successfully started delegation update.');
        } else {
            await delegatePage.changeBakerAddress({
                bakerAddress: 'tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf',
                feeLevel: 'Low',
                walletPassword: process.env.TZ1_PASSWORD,
                send: true,
            });
            await delegatePage.assertPopUpAlert('Successfully started delegation update.');
        }
    });

    it('cancel delegation happy path', async function () {
        // check if all transaction are finshed
        await delegatePage.navigateToSection('Transactions');
        await transactionPage.waitUntilPendingTransactionFinished();

        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        const bakerAddress = await delegatePage.retrieveDelegateToAddres();
        if (bakerAddress) {
            await delegatePage.changeBakerAddress({
                bakerAddress: 'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9',
                feeLevel: 'Low',
                walletPassword: process.env.TZ1_PASSWORD,
                send: true,
            });
            await delegatePage.assertPopUpAlert('Successfully started delegation update.');
        } else {
            this.skip();
        }
    });

    it('change baker address to previous one', async function () {
        // check if all transaction are finshed
        await delegatePage.navigateToSection('Transactions');
        await transactionPage.waitUntilPendingTransactionFinished();

        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);

        const bakerAddress = await delegatePage.retrieveDelegateToAddres();
        if (bakerAddress) {
            await delegatePage.changeBakerAddress({
                bakerAddress: bakerAddress,
                feeLevel: 'Low',
                walletPassword: process.env.TZ1_PASSWORD,
                send: true,
            });
            await app.client.waitForExist(delegatePage.delegationInformationMessageText);
            await app.client.waitForExist('div=(temporary. proto.006-PsCARTHA.delegate.unchanged)', 1000 * 60 * 2);
        } else {
            this.skip();
        }
    });

    it('change baker address to account wallet addres disabled delegate-button', async () => {
        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        await delegatePage.changeBakerAddress({
            bakerAddress: process.env.TZ1_ADDRESS,
            feeLevel: 'Low',
            walletPassword: process.env.TZ1_PASSWORD,
            send: false,
        });
        delegatePage.buttonEnabledFalse(delegatePage.delegateChangeButton);
    });

    it('change baker address input validation', async () => {
        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);

        const testData = [
            ['1', 'You can only delegate to tz1, tz2 or tz3 addresses.'],
            ['tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG', 'Addresses must be 36 characters long.'],
            ['tz1bffffffffffffffffffffffffffffffff38', 'Addresses must be 36 characters long.'],
        ];

        for (data of testData) {
            let message = data[1];
            let arg = data[0];
            await delegatePage.changeBakerAddress({
                bakerAddress: arg,
                feeLevel: 'Low',
                walletPassword: process.env.TZ1_PASSWORD,
                send: false,
            });
            await delegatePage.buttonEnabledFalse(delegatePage.delegateChangeButton);
            const changeBakerMessage = await app.client.getText(delegatePage.delegationBakerAddressMessage);
            assert.equal(changeBakerMessage, message);
        }
        // await delegatePage.changeBakerAddress({
        //     bakerAddress: "1",
        //     feeLevel: "Low",
        //     walletPassword: process.env.TZ1_PASSWORD,
        //     send: false
        // })
        // delegatePage.buttonEnabledFalse(delegatePage.delegateChangeButton)
        // const message = "You can only delegate to tz1, tz2 or tz3 addresses."
        // const changeBakerMessage = await app.client.getText(delegatePage.delegationBakerAddressMessage)
        // assert.equal(changeBakerMessage, message)
    });

    it('change baker address to new one but not registered', async () => {
        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        await delegatePage.changeBakerAddress({
            bakerAddress: process.env.TZ3_ADDRESS,
            feeLevel: 'Low',
            walletPassword: process.env.TZ1_PASSWORD,
            send: true,
        });

        //sometime it's going with success...
        await delegatePage.assertPopUpAlert('(permanent. proto.006-PsCARTHA.contract.manager.unregistered_delegate)');
    });

    it('change baker address to registered one', async function () {
        // check if all transaction are finshed
        await delegatePage.navigateToSection('Transactions');
        await transactionPage.waitUntilPendingTransactionFinished();

        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        const bakerAddress = await delegatePage.retrieveDelegateToAddres();
        if (bakerAddress) {
            if (bakerAddress === 'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9') {
                await delegatePage.changeBakerAddress({
                    bakerAddress: 'tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf',
                    feeLevel: 'Low',
                    walletPassword: process.env.TZ1_PASSWORD,
                    send: true,
                });
            } else {
                await delegatePage.changeBakerAddress({
                    bakerAddress: 'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9',
                    feeLevel: 'Low',
                    walletPassword: process.env.TZ1_PASSWORD,
                    send: true,
                });
            }
            await delegatePage.assertPopUpAlert('Successfully started delegation update.');
        } else {
            await delegatePage.changeBakerAddress({
                bakerAddress: 'tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf',
                feeLevel: 'Low',
                walletPassword: process.env.TZ1_PASSWORD,
                send: true,
            });
            await delegatePage.assertPopUpAlert('Successfully started delegation update.');
        }
    });

    it('change baker address with incorrect password', async () => {
        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        const incorrectPassword = 'password';
        await delegatePage.changeBakerAddress({
            bakerAddress: 'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9',
            feeLevel: 'Low',
            walletPassword: incorrectPassword,
            send: true,
        });
        await app.client.waitForExist('div=Incorrect password', 1000 * 60 * 2);
    });

    it.skip('change fee works properly when we leave custom fee empty', async () => {
        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);

        //assertion are hidden in function
        await delegatePage.changeBakerAddress({
            bakerAddress: process.env.TZ3_ADDRESS,
            feeLevel: 'Custom',
            send: false,
        });
    });

    it('add delegation contract', async () => {
        // check if all transaction are finshed
        await delegatePage.navigateToSection('Transactions');
        await transactionPage.waitUntilPendingTransactionFinished();
        await delegatePage.navigateToSection('Delegate');
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        await delegatePage.addDelegationContract({
            delegateAddress: 'tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf',
            amount: 1,
            fee: 'Low',
            walletPassword: process.env.TZ1_PASSWORD,
            delegate: true,
        });
        await delegatePage.assertPopUpAlert('Successfully started address origination.');
    });
});
