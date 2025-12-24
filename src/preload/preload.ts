import {contextBridge, ipcRenderer} from 'electron';
import type {launchOptions} from "../main/minecraft";

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    close: () => ipcRenderer.invoke('win:close'),

    minecraftLaunch: (launchOptions: launchOptions) => ipcRenderer.invoke('launcher:launch', launchOptions),
    openGameDir: () => ipcRenderer.invoke('launcher:openGameDir'),

    delete: (what: "minecraft" | "mods" | "resourcepacks") => ipcRenderer.invoke('launcher:delete', what),

    getServerStatus: async () => {
        return await ipcRenderer.invoke('launcher:getServerStatus');
    },

    getTotalRam: async () => {
        const ramInfo: number = await ipcRenderer.invoke('launcher:getTotalRam');
        return ramInfo;
    },

    onProgressBar: (cb: (visible: boolean, description?: string, percent?: number) => void) => {
        const handler = (_event: unknown, visible: boolean, description: string, percent?: number) => cb(visible, description, percent);

        ipcRenderer.on("launcher:useProgressBar", handler);

        return () => {
            ipcRenderer.removeListener("launcher:useProgressBar", handler);
        };
    },

    onProgressBarSpeed: (cb: (speed?: number) => void) => {
        const handler = (_event: unknown, speed?: number) => cb(speed);

        ipcRenderer.on("launcher:setProgressBarSpeed", handler);

        return () => {
            ipcRenderer.removeListener("launcher:setProgressBarSpeed", handler);
        };
    },

    onProgressBarEstimated: (cb: (estimated?: number) => void) => {
        const handler = (_event: unknown, estimated?: number) => cb(estimated);

        ipcRenderer.on("launcher:setProgressBarEstimated", handler);

        return () => {
            ipcRenderer.removeListener("launcher:setProgressBarEstimated", handler);
        };
    },

    onLaunchButton: (cb: (disabled: boolean, text?: string) => void) => {
        const handler = (_event: unknown, disabled: boolean, text?: string) => cb(disabled, text);

        ipcRenderer.on("launcher:useLaunchButton", handler);

        return () => {
            ipcRenderer.removeListener("launcher:useLaunchButton", handler);
        };
    },

    onAddNotification: (cb: (type: "success" | "info" | "error", text: string) => void) => {
        const handler = (_event: unknown, type: "success" | "info" | "error", text: string) => cb(type, text);

        ipcRenderer.on("launcher:addNotification", handler);

        return () => {
            ipcRenderer.removeListener("launcher:addNotification", handler);
        };
    },
});