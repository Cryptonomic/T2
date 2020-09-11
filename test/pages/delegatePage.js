const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class DelegatePage extends BasePage {
    constructor(app) {
        super(app);
        this.delegationBakerAddressInput = '[data-spectron="baker-address"] input';
        this.delegationBakerAddressMessage = '[data-spectron="baker-address"] p';
        this.delegateAddresPartOne = '[data-spectron="delegate"] [data-spectron="tezos-address"] span span:nth-child(1)';
        this.delegateAddresPartTwo = '[data-spectron="delegate"] [data-spectron="tezos-address"] span span:nth-child(2)';
        this.delegateFeeSection = '[data-spectron="fee-container"]';
        this.delegateLowFee = 'ul li:nth-child(1)';
        this.delegateMediumFee = 'ul li:nth-child(2)';
        this.delegateHighFee = 'ul li:nth-child(3)';
        this.selectedFeeValue = '[data-spectron="selected-fee-value"]';
        this.delegationInformationMessageText = 'div=It will take about 5 weeks (12 cycles) to receive delegation rewards from your baker.';
        this.delegateChangeButton = '[data-spectron="change-delegate-button"]';
        this.delegationWalletPassword = '[data-spectron="wallet-password"] input';
        this.addDelegationButton = '[data-spectron="add-delegation-button"]';
        this.addDelegationTooltop = '[data-spectron="add-delegation-button"] button';

        this.delegationContractsModal = '[data-spectron="delegation-contract-modal"] ';
        this.delegateButtonInModal = '[data-spectron="delegate-button"]';

        this.openaDelegationContractsModal = async () => {
            await this.app.client.click(this.addDelegationButton);
        };

        this.changeFeeLevelinDelegationContractsModal = async (feeLevel) => {
            await this.app.client.click(this.delegationContractsModal + this.delegateFeeSection);
            await sleepApp(1000);
            switch (feeLevel) {
                case 'Low':
                    await this.app.client.click(this.delegateLowFee);
                    await sleepApp(1000);
                    const selectedFee = await this.app.client.getHTML(this.delegationContractsModal + this.selectedFeeValue);
                    assert.equal(selectedFee.includes('Low Fee'), true);
                    break;
                case 'Medium':
                    await this.app.client.click(this.delegateMediumFee);
                    await sleepApp(1000);
                    break;
                case 'High':
                    await this.app.client.click(this.delegateHighFee);
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
                    await this.app.client.click(this.delegateLowFee);
            }
        };

        this.addDelegationContract = async ({
            delegateAddress = undefined,
            amount = undefined,
            fee = undefined,
            walletPassword = undefined,
            delegate = true,
        }) => {
            await this.openaDelegationContractsModal();
            if (delegateAddress) {
                await this.app.client.setValue(this.delegationContractsModal + '[data-spectron="delegate-address"] input', delegateAddress);
                if (!fee || !walletPassword) {
                    await this.buttonEnabledFalse(this.delegateButtonInModal);
                }
            }
            if (amount) {
                await this.app.client.setValue(this.delegationContractsModal + '[data-spectron="amount"] input', amount);
                const total = await this.app.client.getHTML('[data-spectron="total"]');
                assert.equal(true, total.includes('1.'));

                if (!fee || !walletPassword) {
                    await this.buttonEnabledFalse(this.delegateButtonInModal);
                }
            }
            if (fee) {
                await this.changeFeeLevelinDelegationContractsModal(fee);
                if (!delegateAddress || !walletPassword) {
                    await this.buttonEnabledFalse(this.delegateButtonInModal);
                }
            }
            if (walletPassword) {
                await this.app.client.setValue(this.delegationContractsModal + '[data-spectron="wallet-password"] input', walletPassword);
            }
            if (delegate) {
                await this.pushButton(this.delegateButtonInModal);
            }
        };

        this.retrieveDelegateToAddres = async () => {
            let bakerAddress = false;
            const adressExist = await this.app.client.isExisting(this.delegateAddresPartTwo);
            if (adressExist) {
                const addressPartOne = await this.app.client.getText(this.delegateAddresPartOne);
                const addressPartTwo = await this.app.client.getText(this.delegateAddresPartTwo);
                bakerAddress = addressPartOne + addressPartTwo;
            }
            return bakerAddress;
        };

        // this.changeFeeLevel = async (feeLevel, customFeeInt = undefined) => {
        //     await this.app.client.click(this.delegateFeeSection);
        //     let selectedFee;
        //     await sleepApp(2000);
        //     switch (feeLevel) {
        //         case 'Low':
        //             await this.app.client.click(this.delegateLowFee);
        //             await sleepApp(2000);
        //             selectedFee = await this.app.client.getText(this.selectedFeeValue);
        //             assert.equal(selectedFee.includes('Low Fee'), true);
        //             break;
        //         case 'Medium':
        //             await this.app.client.click(this.delegateMediumFee);
        //             selectedFee = await this.app.client.getText(this.selectedFeeValue);
        //             assert.equal(selectedFee.includes('Medium Fee'), true);
        //             await sleepApp(2000);
        //             break;
        //         case 'High':
        //             await this.app.client.click(this.delegateHighFee);
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
        //             await this.app.client.click(this.delegateLowFee);
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
                await this.app.client.setValue(this.delegationBakerAddressInput, bakerAddress);
                if (!feeLevel || !walletPassword) {
                    this.buttonEnabledFalse(this.delegateChangeButton);
                }
            }
            if (feeLevel) {
                await this.changeFeeLevelBASE(feeLevel, customFeeInt);
                if (!bakerAddress || !walletPassword) {
                    this.buttonEnabledFalse(this.delegateChangeButton);
                }
            }
            if (walletPassword) {
                await this.app.client.setValue(this.delegationWalletPassword, walletPassword);
            }
            if (send) {
                await this.app.client.click(this.delegateChangeButton);
            }
        };
    }
}

module.exports = DelegatePage;
