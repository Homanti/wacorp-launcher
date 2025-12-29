import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type {launchOptions} from "../main/minecraft"

interface UpdateInfo {
    version: string;
    releaseDate?: string;
}

interface DownloadProgress {
    percent: number;
    bytesPerSecond: number;
    transferred: number;
    total: number;
}

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    close: () => ipcRenderer.invoke('win:close'),

    minecraftLaunch: (launchOptions: launchOptions) => ipcRenderer.invoke('minecraft:launch', launchOptions),
    openGameDir: () => ipcRenderer.invoke('minecraft:openGameDir'),

    delete: (what: "minecraft" | "mods" | "resourcepacks") => ipcRenderer.invoke('launcher:delete', what),

    getServerStatus: async () => {
        return await ipcRenderer.invoke('minecraft:getServerStatus');
    },

    updateSkin: () => ipcRenderer.invoke('launcher:updateSkin'),

    getTotalRam: async () => {
        const ramInfo: number = await ipcRenderer.invoke('launcher:getTotalRam');
        return ramInfo;
    },

    onProgressBar: (callback: (visible: boolean, description?: string, percent?: number) => void) => {
        const handler = (_event: unknown, visible: boolean, description: string, percent?: number) => callback(visible, description, percent);

        ipcRenderer.on("launcher:useProgressBar", handler);

        return () => {
            ipcRenderer.removeListener("launcher:useProgressBar", handler);
        };
    },

    onProgressBarSpeed: (callback: (speed?: number) => void) => {
        const handler = (_event: unknown, speed?: number) => callback(speed);

        ipcRenderer.on("launcher:setProgressBarSpeed", handler);

        return () => {
            ipcRenderer.removeListener("launcher:setProgressBarSpeed", handler);
        };
    },

    onProgressBarEstimated: (callback: (estimated?: number) => void) => {
        const handler = (_event: unknown, estimated?: number) => callback(estimated);

        ipcRenderer.on("launcher:setProgressBarEstimated", handler);

        return () => {
            ipcRenderer.removeListener("launcher:setProgressBarEstimated", handler);
        };
    },

    onLaunchButton: (callback: (disabled: boolean, text?: string) => void) => {
        const handler = (_event: unknown, disabled: boolean, text?: string) => callback(disabled, text);

        ipcRenderer.on("launcher:useLaunchButton", handler);

        return () => {
            ipcRenderer.removeListener("launcher:useLaunchButton", handler);
        };
    },

    onAddNotification: (callback: (type: "success" | "info" | "error", text: string) => void) => {
        const handler = (_event: unknown, type: "success" | "info" | "error", text: string) => callback(type, text);

        ipcRenderer.on("launcher:addNotification", handler);

        return () => {
            ipcRenderer.removeListener("launcher:addNotification", handler);
        };
    },
});

contextBridge.exposeInMainWorld('updater', {
    checkForUpdates: () => ipcRenderer.invoke('updater:checkForUpdates'),
    downloadUpdate: () => ipcRenderer.invoke('updater:downloadUpdate'),
    quitAndInstall: () => ipcRenderer.invoke('updater:quitAndInstall'),

    onCheckingForUpdate: (callback: () => void) => {
        const subscription = () => callback();
        ipcRenderer.on('updater:checking-for-update', subscription);

        return () => ipcRenderer.removeListener('updater:checking-for-update', subscription);
    },

    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
        const subscription = (_event: IpcRendererEvent, info: UpdateInfo) => callback(info);
        ipcRenderer.on('updater:update-available', subscription);

        return () => ipcRenderer.removeListener('updater:update-available', subscription);
    },

    onUpdateNotAvailable: (callback: () => void) => {
        const subscription = () => callback();
        ipcRenderer.on('updater:update-not-available', subscription);

        return () => ipcRenderer.removeListener('updater:update-not-available', subscription);
    },

    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
        const subscription = (_event: IpcRendererEvent, progress: DownloadProgress) => callback(progress);
        ipcRenderer.on('updater:download-progress', subscription);

        return () => ipcRenderer.removeListener('updater:download-progress', subscription);
    },

    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
        const subscription = (_event: IpcRendererEvent, info: UpdateInfo) => callback(info);
        ipcRenderer.on('updater:update-downloaded', subscription);

        return () => ipcRenderer.removeListener('updater:update-downloaded', subscription);
    },
    onError: (callback: (error: string) => void) => {
        const subscription = (_event: IpcRendererEvent, error: string) => callback(error);
        ipcRenderer.on('updater:error', subscription);

        return () => ipcRenderer.removeListener('updater:error', subscription);
    }
});