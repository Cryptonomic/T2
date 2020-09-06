const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp')
const BasePage = require('./basePage');

class SignAndVerifyPage extends BasePage {
    constructor(app) {
        super(app)
        this.signButton = '[data-spectron="sign-button"]'
        this.signAndVerifyTextArea = '[data-spectron="micheline-input"] textarea:nth-child(1)'
        this.signAndVerifySignatureInput = '[data-spectron="signature-input"] input'
        this.signAndVerifyAddressInput = '[data-spectron="address-input"] input'
        this.signAndVerifySignatureCopyButton = '[data-spectron="signature-value"] [data-spectron="copy-button"]'
        this.signAndVerifyDownVerifyButton = '[data-spectron="verify-button-down"] button'
        this.signAndVerifyConfirmedAlert = 'div=Signature confirmed'
        this.signAndVerifyWrongAlert = 'div=Invalid signature'

        this.clickSignButton = async () => {
            await this.pushButton(this.signButton);
        }

        this.copySignature = async () => {
            await this.app.client.click(this.signAndVerifySignatureCopyButton);
        }

        this.createSignature = async ({ message = undefined, sign = true, copySignature = undefined }) => {
            if (message) {
                await this.app.client.setValue(this.signAndVerifyTextArea, message);
            }
            if (sign) {
                await this.clickSignButton();
            }
            if (copySignature) {
                await this.app.client.waitForExist(this.signAndVerifySignatureCopyButton);
                await this.copySignature()
            }
        }

        this.verifySignature = async ({ message = undefined, signature = undefined, address = undefined, verify = true }) => {
            if (message) {
                await app.client.setValue(this.signAndVerifyTextArea, message);
            }
            if (signature) {
                await app.client.setValue(this.signAndVerifySignatureInput, signature);
            }
            if (address) {
                await app.client.setValue(this.signAndVerifyAddressInput, address);
            }
            if (verify) {
                await this.pushButton(this.signAndVerifyDownVerifyButton);
            }
        }


    }
}

module.exports = SignAndVerifyPage;
