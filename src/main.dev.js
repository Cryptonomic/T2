const electron = require('electron');
const os = require('os');

const { helpUrl } = require('./config.json');

const { ipcMain } = electron;
const app = electron.app;
const Menu = electron.Menu;
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

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isMac = process.platform === 'darwin';
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
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

    const template = [
        // { role: 'appMenu' }
        ...(isMac
            ? [
                  {
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
                  },
              ]
            : []),
        // { role: 'fileMenu' }
        {
            label: '&File',
            submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac
                    ? [
                          { role: 'pasteAndMatchStyle' },
                          { role: 'delete' },
                          { role: 'selectAll' },
                          { type: 'separator' },
                          {
                              label: 'Speech',
                              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
                          },
                      ]
                    : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
            ],
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
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
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }] : [{ role: 'close' }]),
            ],
        },
        {
            role: 'help',
            submenu: !isMac
                ? [
                      { role: 'about' },
                      {
                          label: 'Learn More',
                          click: async () => {
                              await electron.shell.openExternal(helpUrl);
                          },
                      },
                  ]
                : [
                      {
                          label: 'Learn More',
                          click: async () => {
                              await electron.shell.openExternal(helpUrl);
                          },
                      },
                  ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

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
