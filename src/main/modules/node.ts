import { ipcMain } from 'electron';
import * as fs from 'fs';
import os from 'os';
import path from 'path';

ipcMain.on('os-platform', (event) => {
    event.returnValue = os.platform();
});

ipcMain.on('node-path-join', async (event, str1, str2) => {
    event.returnValue = path.join(str1, str2);
});

ipcMain.on('node-fs-writeFile', async (event, filename, wallet) => {
    event.returnValue = await fs.writeFileSync(filename, wallet, { mode: 0o600 });
});

ipcMain.on('node-fs-readfile', async (event, filename) => {
    event.returnValue = await fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
});

ipcMain.on('node-buffer-from', async (event, data: string, encoding = 'utf8') => {
    event.returnValue = Buffer.from(data, encoding);
});
