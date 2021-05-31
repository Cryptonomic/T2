const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class DelegatePage extends BasePage {
    constructor(app) {
        super(app);
        this.bakerAddressInput = '[data-spectron="baker-address"] input';
        this.bakerAddressMessage = '[data-spectron="baker-address"] p';
        this.addresPartOne = '[data-spectron="delegate"] [data-spectron="tezos-address"] span span:nth-child(1)';
        this.addresPartTwo = '[data-spectron="delegate"] [data-spectron="tezos-address"] span span:nth-child(2)';
        this.feeSection = '[data-spectron="fee-container"]';
        this.lowFee = 'ul li:nth-child(1)';
        this.mediumFee = 'ul li:nth-child(2)';
        this.highFee = 'ul li:nth-child(3)';
        this.selectedFeeValue = '[data-spectron="selected-fee-value"]';
        this.informationMessageText = 'div=It will take about 5 weeks (12 cycles) to receive delegation rewards from your baker.';
        this.changeButton = '[data-spectron="change-delegate-button"]';
        this.walletPassword = '[data-spectron="wallet-password"] input';
        this.addDelegationButton = '[data-spectron="add-delegation-button"]';
        this.addDelegationTooltop = '[data-spectron="add-delegation-button"] button';

        this.contractsModal = '[data-spectron="delegation-contract-modal"] ';
        this.delegateButtonInContractModal = '[data-spectron="delegate-button"]';

        this.openacontractsModal = async () => {
            await this.app.client.click(this.addDelegationButton);
        };

        this.changeFeeLevelincontractsModal = async (feeLevel) => {
            await this.app.client.click(this.contractsModal + this.feeSection);
            await sleepApp(1000);
            switch (feeLevel) {
                case 'Low':
                    await this.app.client.click(this.lowFee);
                    await sleepApp(1000);
                    const selectedFee = await this.app.client.getHTML(this.contractsModal + this.selectedFeeValue);
                    assert.equal(selectedFee.includes('Low Fee'), true);
                    break;
                case 'Medium':
                    await this.app.client.click(this.mediumFee);
                    await sleepApp(1000);
                    break;
                case 'High':
                    await this.app.client.click(this.highFee);
                    await sleepApp(1000);
                    break;
                case 'Custom':
                    await this.app.client.click('li=Custom');
                    await this.app.client.setValue('[data-spectron="custom-fee-modal"] input', 0.005);
                    await this.app.client.click('button=Set Custom Fee');
                    const selectedFeeTwo = await this.app.client.getText(this.selectedFeeValue);
                    assert.equal(selectedFeeTwo.includes('0.005'), true);
                    break;
                default:
                    await this.app.client.click(this.lowFee);
            }
        };

        this.addDelegationContract = async ({
            delegateAddress = undefined,
            amount = undefined,
            fee = undefined,
            walletPassword = undefined,
            delegate = true,
        }) => {
            await this.openacontractsModal();
            if (delegateAddress) {
                await this.app.client.setValue(this.contractsModal + '[data-spectron="delegate-address"] input', delegateAddress);
                if (!fee || !walletPassword) {
                    await this.buttonEnabledFalse(this.delegateButtonInContractModal);
                }
            }
            if (amount) {
                await this.app.client.setValue(this.contractsModal + '[data-spectron="amount"] input', amount);
                const total = await this.app.client.getHTML('[data-spectron="total"]');
                assert.equal(true, total.includes('1.'));

                if (!fee || !walletPassword) {
                    await this.buttonEnabledFalse(this.delegateButtonInContractModal);
                }
            }
            if (fee) {
                await this.changeFeeLevelincontractsModal(fee);
                if (!delegateAddress || !walletPassword) {
                    await this.buttonEnabledFalse(this.delegateButtonInContractModal);
                }
            }
            if (walletPassword) {
                await this.app.client.setValue(this.contractsModal + '[data-spectron="wallet-password"] input', walletPassword);
            }
            if (delegate) {
                await this.pushButton(this.delegateButtonInContractModal);
            }
        };

        this.retrieveDelegateToAddres = async () => {
            let bakerAddress = false;
            const adressExist = await this.app.client.isExisting(this.addresPartTwo);
            if (adressExist) {
                const addressPartOne = await this.app.client.getText(this.addresPartOne);
                const addressPartTwo = await this.app.client.getText(this.addresPartTwo);
                bakerAddress = addressPartOne + addressPartTwo;
            }
            return bakerAddress;
        };

        // this.changeFeeLevel = async (feeLevel, customFeeInt = undefined) => {
        //     await this.app.client.click(this.feeSection);
        //     let selectedFee;
        //     await sleepApp(2000);
        //     switch (feeLevel) {
        //         case 'Low':
        //             await this.app.client.click(this.lowFee);
        //             await sleepApp(2000);
        //             selectedFee = await this.app.client.getText(this.selectedFeeValue);
        //             assert.equal(selectedFee.includes('Low Fee'), true);
        //             break;
        //         case 'Medium':
        //             await this.app.client.click(this.mediumFee);
        //             selectedFee = await this.app.client.getText(this.selectedFeeValue);
        //             assert.equal(selectedFee.includes('Medium Fee'), true);
        //             await sleepApp(2000);
        //             break;
        //         case 'High':
        //             await this.app.client.click(this.highFee);
        //             selectedFee = await this.app.client.getText(this.selectedFeeValue);
        //             assert.equal(selectedFee.includes('High Fee'), true);
        //             await sleepApp(2000);
        //             break;
        //         case 'Custom':
        //             await this.app.client.click('li=Custom');
        //             if (customFeeInt) {
        //                 await this.app.client.setValue('[data-spectron="custom-fee-modal"] input', customFeeInt);
        //             }
        //             if (!customFeeInt) {
        //                 await this.buttonEnabledFalse('button=Set Custom Fee');
        //             }
        //             await this.app.client.click('button=Set Custom Fee');
        //             sleepApp(2000);
        //             const selectedFeeTwo = await this.app.client.getText(this.selectedFeeValue);
        //             if (customFeeInt) {
        //                 assert.equal(selectedFeeTwo.includes(customFeeInt), true);
        //             }
        //             break;
        //         default:
        //             await this.app.client.click(this.lowFee);
        //     }
        // };

        this.changeBakerAddress = async ({
            bakerAddress = undefined,
            feeLevel = undefined,
            customFeeInt = undefined,
            walletPassword = undefined,
            send = undefined,
        }) => {
            if (bakerAddress) {
                await this.app.client.setValue(this.addressInput, bakerAddress);
                if (!feeLevel || !walletPassword) {
                    this.buttonEnabledFalse(this.changeButton);
                }
            }
            if (feeLevel) {
                await this.changeFeeLevelBASE(feeLevel, customFeeInt);
                if (!bakerAddress || !walletPassword) {
                    this.buttonEnabledFalse(this.changeButton);
                }
            }
            if (walletPassword) {
                await this.app.client.setValue(this.walletPassword, walletPassword);
            }
            if (send) {
                await this.app.client.click(this.changeButton);
            }
        };
    }
}

module.exports = DelegatePage;
