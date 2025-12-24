import {contextBridge, ipcRenderer} from 'electron';
import type {launchOptions} from "../main/minecraft";

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    close: () => ipcRenderer.invoke('win:close'),

    minecraftLaunch: (launchOptions: launchOptions) => ipcRenderer.invoke('launcher:launch', launchOptions),
    openGameDir: () => ipcRenderer.invoke('launcher:openGameDir'),

    reinstall: (what: "mods" | "resourcepacks") => ipcRenderer.invoke('launcher:reinstall', what),
    deleteGameDir: () => ipcRenderer.invoke('launcher:deleteGameDir'),

    getServerStatus: async () => {
        return await ipcRenderer.invoke('launcher:getServerStatus');
    },

    getTotalRam: async () => {
        const ramInfo: number = await ipcRenderer.invoke('launcher:getTotalRam');
        return ramInfo;
    },

    onProgressBar: (cb: (visible: boolean, description?: string, percent?: number | null) => void) => {
        const handler = (_event: unknown, visible: boolean, description: string, percent?: number | null) => cb(visible, description, percent);

        ipcRenderer.on("launcher:useProgressBar", handler);

        return () => {
            ipcRenderer.removeListener("launcher:useProgressBar", handler);
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