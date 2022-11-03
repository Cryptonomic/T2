/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, clipboard, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import * as png from 'pngjs';
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

import { KeyStoreUtils as KeyStoreUtilsLedger } from 'conseiljs-ledgersigner';
import os from 'os';

import { registerFetch, registerLogger } from 'conseiljs';
import fetch from 'electron-fetch';
import * as loglevel from 'loglevel';
import { schema, defaultStore } from '../renderer/utils/localData';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

import config from '../renderer/config.json';

import './modules/conseiljs';
import './modules/conseiljsSoftSigner';
import './modules/node';

// require('@electron/remote/main').initialize()

const logger = loglevel.getLogger('conseiljs');
logger.setLevel(config.logLevel as loglevel.LogLevelDesc, false);
registerLogger(logger);
registerFetch(fetch);

const store = new Store({ schema, defaults: defaultStore });

// IPC listener
ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (event, key, val) => {
    store.set(key, val);
});

ipcMain.on('electron-store-all-set', async (event, val) => {
    store.set(val);
});

ipcMain.on('electron-store-delete', async (event, key) => {
    store.delete(key);
});

ipcMain.on('open-enternal-link', async (event, url) => {
    shell.openExternal(url);
});

ipcMain.on('conseiljs-ledgersigner-KeyStoreUtils-unlockAddress', async (event, derivationPath: string) => {
    event.returnValue = await KeyStoreUtilsLedger.unlockAddress(derivationPath);
});

ipcMain.on('conseiljs-ledgersigner-KeyStoreUtils-getTezosPublicKey', async (event, derivationPath: string) => {
    event.returnValue = await KeyStoreUtilsLedger.getTezosPublicKey(derivationPath);
});

ipcMain.on('electron-pngjs-get', async (event, imageDataBytes) => {
    const image = new png.PNG({ width: 8, height: 8, bitDepth: 8, colorType: 2, inputColorType: 2, inputHasAlpha: false });
    image.data = Buffer.from(imageDataBytes, 'hex');
    const buffer = png.PNG.sync.write(image, { width: 8, height: 8, bitDepth: 8, colorType: 2, inputColorType: 2, inputHasAlpha: false });
    const artifactUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    event.returnValue = store.get(artifactUrl);
});

ipcMain.on('os-platform', (event) => {
    event.returnValue = os.platform();
});

ipcMain.on('transportNodeHid-device-lists', async (event) => {
    event.returnValue = await TransportNodeHid.list();
});

ipcMain.on('wallet', (event, data) => {
    event.sender.send('wallet', data);
});

ipcMain.on('electron-clipboard', async (event, text) => {
    clipboard.writeText(text);
});

ipcMain.on('electron-dialog-open', async (event, dialogFilters) => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: dialogFilters });
    const { filePaths } = result;
    if (filePaths && filePaths.length) {
        event.returnValue = {
            location: path.dirname(filePaths[0]),
            fileName: path.basename(filePaths[0]),
        };
    } else {
        event.returnValue = {};
    }
});

ipcMain.on('electron-dialog-save', async (event, dialogFilters) => {
    const result = await dialog.showSaveDialog({ filters: dialogFilters });
    if (result.filePath) {
        event.returnValue = {
            location: path.dirname(result.filePath),
            fileName: path.basename(result.filePath),
        };
    } else {
        event.returnValue = {};
    }
});

// ipcMain.on('electron-remote-dialog-showSaveDialog', async (event, text) => {

// });

// ipcMain.on('electron-remote-dialog-showOpenDialog', async (event, dialogFilters) => {
//   const currentWindow = getCurrentWindow();
//   event.returnValue = dialog
//             .showOpenDialog(currentWindow, {
//                 properties: ['openFile'],
//                 filters: dialogFilters,
//             })
//             // .then((result: any) => {
//             //     const filePaths = result.filePaths;
//             //     if (filePaths && filePaths.length) {
//             //         setWalletLocation(path.dirname(filePaths[0]));
//             //         setWalletFileName(path.basename(filePaths[0]));
//             //     }
//             // });
// });

class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
    require('electron-debug')();
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
        .default(
            extensions.map((name) => installer[name]),
            forceDownload
        )
        .catch(console.log);
};

const createWindow = async () => {
    if (isDebug) {
        await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../.erb/dll/preload.js'),
            nodeIntegration: true,
        },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
  new AppUpdater();
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

app.whenReady()
    .then(() => {
        createWindow();
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (mainWindow === null) createWindow();
        });
    })
    .catch(console.log);
