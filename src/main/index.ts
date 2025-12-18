import {app, BrowserWindow, ipcMain, Menu, shell} from 'electron';
import path from 'node:path';
import Minecraft from "./minecraft";
import {promises as fs} from "node:fs";
import os from "node:os";

const createWindow = () => {
    const win = new BrowserWindow({
        width: 900,
        height: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.mjs'),
            contextIsolation: true,
            sandbox: false
        },
    });

    if (process.env.ELECTRON_RENDERER_URL) {
        win.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        win.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    const minecraft = new Minecraft(win);

    ipcMain.handle('win:minimize', (event) => {
        BrowserWindow.fromWebContents(event.sender)?.minimize();
    });

    ipcMain.handle('win:close', (event) => {
        BrowserWindow.fromWebContents(event.sender)?.close();
    });

    ipcMain.handle('launcher:launch', (_event, memory: number) => {
        console.log('Launching minecraft...');
        minecraft.launchMinecraft(memory);
    })

    ipcMain.handle('launcher:openGameDir', async () => {
        console.log('Opening game dir...');
        const dir = minecraft.minecraftPath;

        await fs.mkdir(dir, { recursive: true });
        await shell.openPath(dir);
    })

    ipcMain.handle('launcher:getTotalRam', async () => {
        return os.totalmem() / 1024 / 1024;
    })

    return win;
};

app.whenReady().then(() => {
    createWindow();
    Menu.setApplicationMenu(!app.isPackaged ? Menu.buildFromTemplate([{role: "toggleDevTools"}]) : null);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
