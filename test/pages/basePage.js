const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');

class BasePage {
    constructor(app) {
        this.app = app;
        this.windowCount = 1;
        this.pageTitle = 'Tezori';
        this.managerAddressSectionButton = '[data-spectron="main-addres"]';
        this.languageContinueButton = 'button=Continue';
        this.termsAgreeButton = 'button=I Agree';
        this.settingsButton = '[data-spectron="settings-button"]';
        this.updateTime = '[data-spectron="update-time"]';
        this.refreshButton = '[data-spectron="refresh-button"]';
        this.logOutButton = '[data-spectron="logout-button"]';
        this.popUpMessage = "[data-spectron='message-bar'] [data-spectron='message']";
        this.closePopUpButton = "[data-spectron='message-close']";

        this.openAppMainSection = async () => {
            await this.app.client.click(this.managerAddressSectionButton);
        };

        this.refreshApp = async () => {
            await this.app.client.click(this.refreshButton);
        };

        this.assertPopUpAlert = async (alertMessage) => {
            await this.app.client.waitForExist(this.popUpMessage, 1000 * 60 * 2);
            const alert = await this.app.client.getText(this.popUpMessage);
            await sleepApp(5000);
            assert.equal(true, alert.includes(alertMessage), `pop up: ${alert}`);
        };

        this.selectLanguageAndAgreeToTerms = async () => {
            await this.app.client.click(this.languageContinueButton);
            await this.app.client.click(this.termsAgreeButton);
        };

        this.passLandingSlides = async () => {
            await app.client.pause(300);
            await app.client.click('[data-spectron="landing-next-button"]');
            await app.client.pause(300);
            await app.client.click('[data-spectron="landing-agree-terms"]');
            await app.client.click('[data-spectron="landing-agree-policy"]');
            await app.client.pause(300);
            await app.client.click('[data-spectron="landing-next-button"]');
            await app.client.pause(300);
            await app.client.click('[data-spectron="landing-next-button"]');
            await app.client.pause(300);
            await app.client.click('[data-spectron="landing-next-button"]');
        };

        this.goToSettings = async () => {
            await this.app.client.click(this.settingsButton);
        };

        this.logOutWallet = async () => {
            await this.app.client.click('[data-spectron="logout-button"]');
        };

        this.goBackFromSetting = async () => {
            await this.app.client.click('[data-spectron="settings-go-back"]');
        };

        this.setTestNode = async () => {
            await this.goToSettings();
            await this.app.client.click('[data-spectron="settings-test-node-button"]');
            await this.app.client.click('div=Tezos Testnet (nautilus.cloud)');
            await this.goBackFromSetting();
        };

        this.openExistingWallet = async (password) => {
            await this.app.client.waitForExist('span=Open Existing Wallet');
            await this.app.client.click('span=Open Existing Wallet');
            await this.app.client.click('[data-spectron="select-wallet-button"]');
            const walletFileName = await this.app.client.getText('[data-spectron="wallet-file-name"]');
            // assert.equal(walletFileName, 'tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW.tezwallet');
            let buttonEnabled = await this.app.client.isEnabled('[data-spectron="open-wallet-button"]');
            assert.equal(buttonEnabled, false);

            await this.app.client.addValue('[data-spectron="wallet-password"] input', password);
            await this.app.client.click('[data-spectron="open-wallet-button"]');
            await this.app.client.waitForExist('[data-spectron="main-addres"] [data-spectron="amount"]', 30000);
        };

        this.navigateToSection = async (sectionName) => {
            await this.app.client.click(`span=${sectionName}`);
        };

        this.openDelegationContract = async (index) => {
            await this.app.client.click(`[data-spectron="delegation-contract"]:nth-child(${2 + index})`);
            await sleepApp(300);
        };

        this.openSmartContract = async (index) => {
            await this.app.client.click(`[data-spectron="smart-contract"]:nth-child(${9 + index})`);
            await sleepApp(3000);
        };

        this.openTokenContract = async (tokenName) => {
            await this.app.client.click(`[data-spectron="token-title"]=${tokenName}`);
            await sleepApp(3000);
        };

        this.openSignAndVerify = async () => {
            await this.app.client.click('div=Sign & Verify');
        };

        this.updateWallet = async () => {
            await this.app.click('[data-spectron="refersh-button"]');
            const updateDate = await this.app.getText('[data-spectron="update-time"]');
            const currentDate = moment().format('LT');
            assert.equal(updateDate, currentDate);
        };

        this.returnLastTransaction = async () => {
            const date = await this.app.client.getText('[data-spectron="transaction-date"]');
            const hour = await this.app.client.getText('[data-spectron="transaction-date-hour"]');
            const type = await this.app.client.getText('[data-spectron="transaction-type"]');
            const addressOne = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(1)');
            const addressTwo = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(2)');
            const address = addressOne[0] + addressTwo[0];
            const amount = await this.app.client.getText('[data-spectron="single-transaction"] [data-spectron="tezos-amount"]');

            let fee = 0;
            if (type === 'Sentto') {
                fee = await this.app.client.getText('[data-spectron="fee"] span:nth-child(2)');
            }
            const transactionData = {
                date: date,
                hour: hour[0],
                type: type[0],
                address: address,
                amount: amount[0],
                fee: fee[0],
            };
            return transactionData;
        };

        //-----Create Smart Contract----------------------------------------------------

        this.pushCreateSmartContractButton = async () => {
            await this.app.client.click('[data-spectron="delegation-label"] svg');
            await this.app.client.click('span=Deploy a New Contract');
        };

        this.acceptTestNodeWarningDuringSmartContractCreation = async () => {
            await this.app.client.click('[dataSpectron="understand-check"]');
            await this.app.client.click('[dataSpectron="dont-message"]');
            await this.app.client.click('[data-spectron="proceed-button"]');
        };

        this.startDeployingsmartContract = async () => {
            await this.app.client.click('[data-spectron="proceed-button"]');
        };

        this.fillDeployContractForm = async ({
            smartContract = undefined,
            storage = undefined,
            type = undefined,
            storageLimit = undefined,
            gas = undefined,
            password = undefined,
            deploy = undefined,
        }) => {
            if (storage) {
                await this.app.client.setValue('[data-spectron="storage"] input', storage);
            }
            if (storageLimit) {
                await this.app.client.setValue('[data-spectron="storage-limit"] input', storageLimit);
            }
            if (type) {
                await this.app.client.click('[data-spectron="format-selector"]');
                if (type === 'micheline') {
                    await this.app.client.click(`ul li:nth-child(1)`);
                }
                if (type === 'michelson') {
                    await this.app.client.click(`ul li:nth-child(2)`);
                }
            }
            if (gas) {
                await this.app.client.setValue('[data-spectron="gas-limit"] input', gas);
            }
            if (password) {
                await this.app.client.setValue('[data-spectron="deploy-contract-section"] [data-spectron="wallet-password"] input', password);
            }
            if (smartContract) {
                await this.app.client.setValue('[data-spectron="code-area"] textarea:nth-child(1)', smartContract);
                await sleepApp(3000);
            }
            if (deploy) {
                await this.pushButton('[data-spectron="deploy-button"]');
            }
        };

        this.fillInvokeContractFormFromMainMenu = async ({
            contractAddress = undefined,
            parameters = undefined,
            type = undefined,
            entryPoint = undefined,
            storageLimit = undefined,
            gas = undefined,
            password = undefined,
            invoke = undefined,
        }) => {
            if (contractAddress) {
                await this.app.client.setValue('[data-spectron="contract-address"] input', contractAddress);
            }
            if (parameters) {
                await this.app.client.setValue('[data-spectron="parameters"] input', parameters);
            }
            if (type) {
                await this.app.client.click('[data-spectron="format-selector"]');
                if (type === 'micheline') {
                    await this.app.client.click(`ul li:nth-child(1)`);
                }
                if (type === 'michelson') {
                    await this.app.client.click(`ul li:nth-child(2)`);
                }
            }
            if (entryPoint) {
                await this.app.client.setValue('[data-spectron="entry-point"] input', entryPoint);
            }
            if (storageLimit) {
                await this.app.client.setValue('[data-spectron="storage-limit"] input', storageLimit);
            }
            if (gas) {
                await this.app.client.setValue('[data-spectron="gas-limit"] input', gas);
            }
            if (password) {
                await this.app.client.setValue('[data-spectron="deploy-contract-section"] [data-spectron="wallet-password"] input', password);
            }
            if (invoke) {
                await this.pushButton('[data-spectron="invoke-button"]');
            }
        };

        //-----Const component methods--------------------------------------------------

        this.changeFeeLevelBASE = async (feeLevel, customFeeInt = undefined) => {
            let selectedFee;
            await this.app.client.click('[data-spectron="fee-container"]');
            await sleepApp(1000);
            switch (feeLevel) {
                case 'Low':
                    await this.app.client.click('ul li:nth-child(1)');
                    await sleepApp(2000);
                    // const selectedFee = await this.app.client.getText('[data-spectron="selected-fee-value"]');
                    // assert.equal(selectedFee.includes('Low Fee'), true);
                    break;
                case 'Medium':
                    await this.app.client.click('ul li:nth-child(2)');
                    await sleepApp(2000);
                    break;
                case 'High':
                    await this.app.client.click('ul li:nth-child(3)');
                    await sleepApp(2000);
                    break;
                case 'Custom Preset':
                    await this.app.client.click('ul li:nth-child(4)');
                    await sleepApp(2000);
                    break;
                case 'Custom':
                    await this.app.client.click('[data-value="custom"]');
                    if (customFeeInt) {
                        await this.app.client.setValue('[data-spectron="custom-fee-modal"] input', customFeeInt);
                        await sleepApp(2000);
                    }
                    if (!customFeeInt) {
                        await this.buttonEnabledFalse('[data-spectron="set-custom-fee-button"]');
                    }
                    await this.app.client.click('[data-spectron="custom-fee-modal"] button');
                    // selectedFee = await this.app.client.getText('[data-spectron="selected-fee-value"]');
                    // if (customFeeInt) {
                    //     assert.equal(selectedFeeTwo.includes(customFeeInt), true);
                    // }
                    break;
                default:
                    await this.app.client.click('ul li:nth-child(1)');
            }
            selectedFee = await this.app.client.getText('[data-spectron="selected-fee-value"]');
            return selectedFee;
        };

        this.retrieveSelectedFeeValueBase = async () => {
            const selectedFee = await this.app.client.getText('[data-spectron="selected-fee-value"]');
            const splitFee = selectedFee.split(' ');
            const retrievedFee = parseFloat(splitFee[2]);
            return retrievedFee;
        };

        //-----Spectron API wrapped it more readable function---------------------

        this.getWindowCount = async () => {
            return await this.app.client.waitUntilWindowLoaded().getWindowCount();
        };

        this.getApplicationTitle = function () {
            return this.app.client.waitUntilWindowLoaded().getTitle();
        };

        this.buttonEnabledFalse = async (selector) => {
            let buttonEnabled = await this.app.client.isEnabled(selector);
            assert.equal(buttonEnabled, false, `Button: ${selector} is enabled but shouldn't`);
        };

        this.assertClipBoard = async (text) => {
            const clipboardAddress = await this.app.electron.clipboard.readText();
            assert.equal(clipboardAddress, text, 'clipboard text different');
        };

        this.pushButton = async function (selectron) {
            await this.app.client.waitUntil(async () => (await this.app.client.isEnabled(selectron)) === true, {
                timeout: 5000,
                timeoutMsg: `expected button ${selectron} to be enabled`,
            });
            await this.app.client.click(selectron);
        };
    }
}

module.exports = BasePage;
