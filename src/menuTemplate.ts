import { app, ipcMain } from 'electron';
import { AboutWindow } from './main/about';

export const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() {
                    app.quit(); // This is standart function to quit app.
                }
            },
            {
                label: 'About',
                click() {
                    ipcMain.emit('show-about-window-event'); // In such way we can trigger function in the main process
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
            { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
            { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
            { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
            { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
            { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
        ]
    },
    {
        label: 'Help',
        submenu: [{ label: 'Cryptonomic Version: 0.0.6', enabled: false }]
    }
];

ipcMain.on('show-about-window-event', () => {
    AboutWindow.show();
});
