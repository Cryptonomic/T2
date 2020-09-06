const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');

const { sleepApp } = require('./utils/sleepApp')

const DelegatePage = require('./pages/delegatePage');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

// Notes:
// -> jest cos takiego jak cancel delegacji ( widoczny w tranzakcji): pojawil sie gdy zmienilem adress baker na
// aktualnie wybrany, znika wtedy delegacja -> jak normalnie dokonac cancel?
// -> wyswietlajace komunikaty są brzydkie np. ze baker jest niezmieniony
// -> obsłuzyć sytuacje gdy nie ma delegate to wypelnionego


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

    beforeEach(async () => {
        await app.start();
        await delegatePage.selectLanguageAndAgreeToTerms();
        await delegatePage.setTestNode();
        await delegatePage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('change baker address to previous one', async function () {
        await delegatePage.navigateToSection("Delegate");
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);

        const bakerAddress = await delegatePage.retrieveDelegateToAddres();
        if (bakerAddress) {
            await delegatePage.changeBakerAddress({
                bakerAddress: bakerAddress,
                feeLevel: "Low",
                walletPassword: process.env.TZ1_PASSWORD,
                send: true
            })
            await app.client.waitForExist(delegatePage.delegationInformationMessageText);
            await app.client.waitForExist("div=(temporary. proto.006-PsCARTHA.delegate.unchanged)", 1000 * 60 * 2)
        } else (this.skip(() => {
            console.log("there was no previous baker choosen")
        }))

    });

    it('change baker address to account wallet addres disabled button', async () => {
        await delegatePage.navigateToSection("Delegate");
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        await delegatePage.changeBakerAddress({
            bakerAddress: process.env.TZ1_ADDRESS,
            feeLevel: "Low",
            walletPassword: process.env.TZ1_PASSWORD,
            send: false
        })
        delegatePage.buttonEnabledFalse(delegatePage.delegateChangeButton)
    });

    it('change baker address to new one but not registered', async () => {
        await delegatePage.navigateToSection("Delegate");
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        await delegatePage.changeBakerAddress({
            bakerAddress: process.env.TZ3_ADDRESS,
            feeLevel: "Low",
            walletPassword: process.env.TZ1_PASSWORD,
            send: true
        })
        await app.client.waitForExist("div=(permanent. proto.006-PsCARTHA.contract.manager.unregistered_delegate)", 1000 * 60 * 2)
    });

    it('change baker address to registered one', async function () {
        await delegatePage.navigateToSection("Delegate");
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        const bakerAddress = await delegatePage.retrieveDelegateToAddres();
        if (bakerAddress) {
            if (bakerAddress === "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9") {
                await delegatePage.changeBakerAddress({
                    bakerAddress: "tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf",
                    feeLevel: "Low",
                    walletPassword: process.env.TZ1_PASSWORD,
                    send: true
                })
            }
            else {
                await delegatePage.changeBakerAddress({
                    bakerAddress: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
                    feeLevel: "Low",
                    walletPassword: process.env.TZ1_PASSWORD,
                    send: true
                })
            }
            await app.client.waitForExist("[data-spectron='message-bar'] [data-spectron='message']", 1000 * 60 * 2)
            const alert = await app.client.getHTML("[data-spectron='message-bar'] [data-spectron='message']")
            console.log(alert)
            // assert.equal(alert.includes("Successfully started delegation update."), true)
        }
        else {
            await delegatePage.changeBakerAddress({
                bakerAddress: "tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf",
                feeLevel: "Low",
                walletPassword: process.env.TZ1_PASSWORD,
                send: true
            })
            await app.client.waitForExist("[data-spectron='message-bar'] [data-spectron='message']", 1000 * 60 * 2)
            const alert = await app.client.getHTML("[data-spectron='message-bar'] [data-spectron='message']")
            console.log(alert)
            // assert.equal(alert.includes("Successfully started delegation update."), true)
        }
    });

    it('change baker address with incorrect password', async () => {
        await delegatePage.navigateToSection("Delegate");
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        const incorrectPassword = "password";
        await delegatePage.changeBakerAddress({
            bakerAddress: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
            feeLevel: "Low",
            walletPassword: incorrectPassword,
            send: true
        })
        await app.client.waitForExist("div=Incorrect password", 1000 * 60 * 2)
    });

    it('add delegation contract', async () => {
        await delegatePage.navigateToSection("Delegate");
        await app.client.waitForExist(delegatePage.delegationBakerAddressInput);
        await delegatePage.addDelegationContract({
            delegateAddress: "tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf",
            amount: 1,
            fee: "Low",
            walletPassword: process.env.TZ1_PASSWORD,
            delegate: true
        })
        await app.client.waitForExist("[data-spectron='message-bar'] [data-spectron='message']", 1000 * 60 * 2)
        const alert = await app.client.getHTML("[data-spectron='message-bar'] [data-spectron='message']")
        assert.equal(true, alert.includes("Successfully started address origination."));
    });
});
