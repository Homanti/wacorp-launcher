import {app, BrowserWindow, ipcMain, Menu, shell} from 'electron';
import path from 'node:path';
import Minecraft, {type launchOptions} from "./minecraft";
import {promises as fs} from "node:fs";
import os from "node:os";
import log from 'electron-log';
import pkg from 'electron-updater';
import {discordRPC} from "./utils/DiscordRPCManager";

const { autoUpdater } = pkg;

log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
log.transports.file.maxSize = 1024 * 1024 * 100;
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

const createWindow = () => {
    const win = new BrowserWindow({
        width: 975,
        height: 650,
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

    ipcMain.handle('minecraft:launch', (_event, launchOptions: launchOptions) => {
        minecraft.launchMinecraft(launchOptions);
    })

    ipcMain.handle('minecraft:openGameDir', async () => {
        log.info('Opening game dir...');
        const dir = minecraft.minecraftPath;

        await fs.mkdir(dir, { recursive: true });
        await shell.openPath(dir);
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

    ipcMain.handle('minecraft:getServerStatus', async () => {
        return minecraft.getServerStatus();
    })

    ipcMain.handle('launcher:getTotalRam', async () => {
        return os.totalmem() / 1024 / 1024;
    })

    ipcMain.handle('updater:checkForUpdates', async () => {
        if (!app.isPackaged) return { available: false };
        return await autoUpdater.checkForUpdates();
    });

    ipcMain.handle('updater:downloadUpdate', () => {
        autoUpdater.downloadUpdate();
    });

    ipcMain.handle('updater:quitAndInstall', () => {
        autoUpdater.quitAndInstall();
    });

    if (app.isPackaged) {
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = true;


        autoUpdater.on('checking-for-update', () => {
            log.info('Checking for update...');
            win.webContents.send('updater:checking-for-update');
        });

        autoUpdater.on('update-available', (info) => {
            log.info('Update available:', info);
            win.webContents.send('updater:update-available', {
                version: info.version,
                releaseDate: info.releaseDate,
                files: info.files
            });
        });

        autoUpdater.on('update-not-available', (info) => {
            log.info('Update not available:', info);
            win.webContents.send('updater:update-not-available');
        });

        autoUpdater.on('error', (err) => {
            log.error('Error in auto-updater:', err);
            win.webContents.send('updater:error', err.message);
        });

        autoUpdater.on('download-progress', (progressObj) => {
            log.info(`Downloaded ${progressObj.percent}%`);
            win.webContents.send('updater:download-progress', {
                percent: progressObj.percent,
                bytesPerSecond: progressObj.bytesPerSecond,
                transferred: progressObj.transferred,
                total: progressObj.total
            });
        });

        autoUpdater.on('update-downloaded', (info) => {
            log.info('Update downloaded:', info);
            win.webContents.send('updater:update-downloaded', {
                version: info.version
            });
        });
    }

    return win;
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
            const win = windows[0];
            if (win.isMinimized()) win.restore();
            if (!win.isVisible()) win.show();
            win.focus();
        }
    });

    app.whenReady().then(async () => {
        createWindow();
        Menu.setApplicationMenu(!app.isPackaged ? Menu.buildFromTemplate([{role: "toggleDevTools"}]) : null);

        await discordRPC.connect();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

app.on('before-quit', async () => {
    await discordRPC.disconnect();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});