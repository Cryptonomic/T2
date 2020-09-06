const electron = require('electron');
const os = require('os');
const { desktopCapturer } = require('electron');
const { ipcMain } = electron;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const openCustomProtocol = (url, appWindow) => {
    const currentURL = appWindow.webContents.getURL().match(/#(\/\w+\/?\w+)/);

    if (!currentURL) {
        return;
    }

    if (currentURL[1] === '/login') {
        appWindow.webContents.send('login', 'Please open a wallet and try the request again');
        return;
    }

    if (currentURL[1] === '/home/main') {
        appWindow.webContents.send('wallet', url);
    }
};

ipcMain.on('os-platform', (event) => {
    event.returnValue = os.platform();
});

// [TESTING]
ipcMain.on('is-spectron', (e) => {
    e.returnValue = process.env.WEB_CLIENT === 'spectron';
});



// [TESTING]
let count = 0;
ipcMain.on('testing-wallet', (e) => {
    let path = require('path');
    const baseDir = path.join(__dirname, '..');
    let walletLocation = path.join(baseDir, 'test', 'walletsData', "tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW.tezwallet");
    if (count % 2 != 0) {
        walletLocation = path.join(baseDir, 'test', 'walletsData', "tz2_test.tezwallet");
    }
    count += 1
    e.returnValue = `${walletLocation}`;
});

// [TESTING]
ipcMain.on('new-wallet', (e) => {
    e.returnValue = `${__dirname}/new.tezwallet`;
});

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    require('electron-debug')();
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(extensions.map((name) => installer.default(installer[name], forceDownload))).catch();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('open-url', (event, url) => {
    // Protocol handler for osx
    event.preventDefault();
    openCustomProtocol(url, mainWindow);
});

app.setAsDefaultProtocolClient('galleon');

app.on('ready', async () => {
    let allowDevTools = false;
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
        await installExtensions();
        allowDevTools = true;
    }

    mainWindow = new BrowserWindow({
        height: 768,
        minHeight: 768,
        minWidth: 1024,
        show: false,
        title: 'Tezori',
        webPreferences: { nodeIntegration: true, devTools: allowDevTools },
        width: 1120,
    });

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }

        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    if (process.platform === 'win32') {
        openCustomProtocol(process.argv.slice(1), mainWindow);
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
