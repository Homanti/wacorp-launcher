import {app, BrowserWindow, ipcMain, Menu, shell} from 'electron';
import path from 'node:path';
import Minecraft, {type launchOptions} from "./minecraft";
import {promises as fs} from "node:fs";
import os from "node:os";
import log from 'electron-log';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

log.transports.file.resolvePathFn = () => {
    const logDir = app.isPackaged
        ? path.join(process.resourcesPath, 'logs')
        : path.join(__dirname, '../../logs');
    return path.join(logDir, 'main.log');
};
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
Object.assign(console, log.functions);

log.info('App starting...');

if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
        log.info('Update available:', info);
    });

    autoUpdater.on('update-not-available', (info) => {
        log.info('Update not available:', info);
    });

    autoUpdater.on('error', (err) => {
        log.error('Error in auto-updater:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        log.info(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
    });

    autoUpdater.on('update-downloaded', (info) => {
        log.info('Update downloaded:', info);
    });
} else {
    log.info('Auto-updater disabled in development mode');
}

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

    ipcMain.handle('launcher:launch', (_event, launchOptions: launchOptions) => {
        minecraft.launchMinecraft(launchOptions);
    })

    ipcMain.handle('launcher:openGameDir', async () => {
        log.info('Opening game dir...');
        const dir = minecraft.minecraftPath;

        await fs.mkdir(dir, { recursive: true });
        await shell.openPath(dir);
    })

    ipcMain.handle('launcher:getTotalRam', async () => {
        return os.totalmem() / 1024 / 1024;
    })

    ipcMain.handle('launcher:delete', async (_event, what: "minecraft" | "mods" | "resourcepacks") => {
        if (what === "minecraft") {

            try {
                await fs.rm(minecraft.minecraftPath, {recursive: true, force: true});
                win.webContents.send("launcher:addNotification", "success", "Minecraft успешно удален!");
            } catch (e) {
                log.error(e);
                win.webContents.send("launcher:addNotification", "error", "Ошибка во время удаление Minecraft");
            }

        } else if (what === "mods") {
            try {
                await fs.rm(path.join(minecraft.minecraftPath, 'mods'), {recursive: true, force: true})
                await fs.rm(minecraft.authLibDir, {recursive: true, force: true})

                win.webContents.send("launcher:addNotification", "success", "Моды успешно удалены!");
            } catch (e) {
                log.error(e);
                win.webContents.send("launcher:addNotification", "error", "Ошибка во время удаление модов");
            }

        } else if (what === "resourcepacks") {
            try {
                await fs.rm(path.join(minecraft.minecraftPath, 'resourcepacks'), {recursive: true, force: true})
                await fs.rm(path.join(minecraft.minecraftPath, 'pointblank'), {recursive: true, force: true})

                win.webContents.send("launcher:addNotification", "success", "Ресурс паки успешно удалены!");
            } catch (e) {
                log.error(e);
                win.webContents.send("launcher:addNotification", "error", "Ошибка во время удаление ресурс паков");
            }
        }
    })

    ipcMain.handle('launcher:getServerStatus', async () => {
        return minecraft.getServerStatus();
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