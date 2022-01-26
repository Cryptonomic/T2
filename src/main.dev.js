const { app, ipcMain, Menu, BrowserWindow, shell } = require('electron');
const os = require('os');

const { helpUrl, aboutUrl, customProtocols } = require('./config.json');
const appName = require('./config.json').name;

const openCustomProtocol = (url, appWindow) => {
    const currentURL = appWindow.webContents.getURL().match(/#(\/\w+\/?\w+)/);

    if (!currentURL) {
        return;
    } else if (currentURL[1] === '/login') {
        appWindow.webContents.send('login', 'Please open a wallet and retry the operation', url); // TODO: localization
    } else if (currentURL[1] === '/home/main') {
        appWindow.webContents.send('wallet', url);
    }
};

ipcMain.on('os-platform', (event) => {
    event.returnValue = os.platform();
});

ipcMain.on('wallet', (event, data) => {
    event.sender.send('wallet', data);
});

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' || appName.toLowerCase() === 'tezori';

if (isDevelopment) {
    require('electron-debug')();
}

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(extensions.map((name) => installer.default(installer[name], forceDownload))).catch();
};

app.on('window-all-closed', () => {
    app.quit();
});

app.on('open-url', (event, url) => {
    // Protocol handler for osx
    event.preventDefault();
    openCustomProtocol(url, mainWindow);
});

customProtocols.map((s) => app.setAsDefaultProtocolClient(s));

app.on('ready', async () => {
    if (isDevelopment) {
        await installExtensions();
    }

    let menuTemplate = [];
    if (isMac) {
        menuTemplate.push({
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        });
    }

    menuTemplate.push({ label: '&File', submenu: [isMac ? { role: 'close' } : { role: 'quit' }] });

    menuTemplate.push({
        label: '&Edit',
        submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'delete' }],
    });

    if (isDevelopment) {
        menuTemplate.push({
            label: '&View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        });
    }

    menuTemplate.push({
        label: '&Window',
        submenu: [
            { role: 'minimize' },
            { role: 'zoom' },
            ...(isMac ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }] : [{ role: 'close' }]),
        ],
    });

    menuTemplate.push({
        role: 'help',
        submenu: [
            ...(!isMac
                ? [
                      {
                          role: 'about',
                          label: 'About',
                          click: async () => {
                              if (!aboutUrl.startsWith('https://')) {
                                  throw new Error('Invalid URL provided, only https scheme is accepted');
                              }
                              await shell.openExternal(aboutUrl);
                          },
                      },
                  ]
                : []),
            {
                label: 'Learn More',
                click: async () => {
                    if (!helpUrl.startsWith('https://')) {
                        throw new Error('Invalid URL provided, only https scheme is accepted');
                    }
                    await shell.openExternal(helpUrl);
                },
            },
        ],
    });

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    mainWindow = new BrowserWindow({
        height: 768,
        minHeight: 768,
        minWidth: 1024,
        show: false,
        title: 'Tezori',
        webPreferences: { nodeIntegration: true, devTools: isDevelopment },
        width: 1120,
    });

    if (!app.requestSingleInstanceLock()) {
        app.quit();
    } else {
        app.on('second-instance', (event, argv) => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }
                mainWindow.focus();

                const protocolUrls = argv.filter((s) => customProtocols.map((p) => s.startsWith(p)).reduce((a, c) => a || c));
                if (protocolUrls && protocolUrls.length > 0) {
                    openCustomProtocol(protocolUrls[0], mainWindow);
                }
            }
        });
    }

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    // @TODO: Use 'ready-to-show' event
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

    if (isMac) {
        //
    } else if (isWindows) {
        openCustomProtocol(process.argv.slice(1), mainWindow);
    } else {
        const protocolUrls = process.argv.filter((s) => customProtocols.map((p) => s.startsWith(p)).reduce((a, c) => a || c));
        if (protocolUrls && protocolUrls.length > 0) {
            openCustomProtocol(protocolUrls[0], mainWindow);
        }
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
