import { app, BrowserWindow } from 'electron';
import * as path from 'path';

export let AboutWindow: BrowserWindow;

app.on('ready', () => {
    AboutWindow = new BrowserWindow({
        show: false,
        width: 300,
        height: 336,
        frame: false,
        backgroundColor: '#E4ECEF'
    });

    AboutWindow.loadURL(`file://${path.join(__dirname, '..')}/src/pages/about_page.html`);

    AboutWindow.on('blur', () => {
        AboutWindow.hide();
    });

    AboutWindow.on('show', () => {});
});
