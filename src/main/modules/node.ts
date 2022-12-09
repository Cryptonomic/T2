import { ipcMain } from 'electron';
import * as fs from 'fs';
import os from 'os';
import path from 'path';
import fetch from 'electron-fetch';
import bs58check from 'bs58check';

ipcMain.handle('os-platform', (event) => {
    const res = os.platform();
    return res;
});

ipcMain.handle('node-path-join', async (event, str1, str2) => {
    return path.join(str1, str2);
});

ipcMain.handle('node-fs-writeFile', async (event, filename, wallet) => {
    const res = await fs.writeFileSync(filename, wallet, { mode: 0o600 });
    return res;
});

ipcMain.handle('node-fs-readfile', async (event, filename) => {
    const res = await fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' });
    return res;
});

ipcMain.on('node-buffer-from', async (event, data: string, encoding = 'utf8') => {
    const res = Buffer.from(data, encoding);
    event.returnValue = res;
});

ipcMain.on('node-buffer-from-string', async (event, data: string, type = 'utf8', encoding?: BufferEncoding) => {
    try {
        const res = Buffer.from(data, type);
        event.returnValue = res.toString(encoding);
    } catch (e) {
        event.returnValue = '';
    }
});

ipcMain.handle('node-buffer-alloc', async (event, val: number) => {
    const res = Buffer.alloc(val);
    return res;
});

ipcMain.handle('electron-fetch', async (event, url: string, options) => {
    try {
        const res = await fetch(url, options);
        const result = await res.json();
        return result;
    } catch (e) {
        throw new Error('error');
    }
});
ipcMain.handle('electron-fetch-timeout', async (event, url: string, options) => {
    try {
        const { timeout = 5000 } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        const result = await response.json();
        return result;
    } catch (e) {
        throw new Error('error');
    }
});

ipcMain.handle('bs58check-decode-string', async (event, val) => {
    const res = await bs58check.decode(val).toString();
    return res;
});
