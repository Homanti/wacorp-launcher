import { contextBridge, ipcRenderer } from 'electron';
console.log('PRELOAD LOADED, contextIsolated=', process.contextIsolated);

type LauncherProgress = { progress: number; size: number; element: string };

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    close: () => ipcRenderer.invoke('win:close'),
    minecraftLaunch: (memory: number) => ipcRenderer.invoke('launcher:launch', memory),
    openGameDir: () => ipcRenderer.invoke('launcher:openGameDir'),

    getTotalRam: async () => {
        const ramInfo: number = await ipcRenderer.invoke('launcher:getTotalRam');
        return ramInfo;
    },

    onProgress: (cb: (data: LauncherProgress) => void) => {
        const handler = (_event: unknown, data: LauncherProgress) => cb(data);
        ipcRenderer.on("launcher:progress", handler);

        return () => {
            ipcRenderer.removeListener("launcher:progress", handler);
        };
    },

    onChecking: (cb: (data: LauncherProgress) => void) => {
        const handler = (_event: unknown, data: LauncherProgress) => cb(data);
        ipcRenderer.on("launcher:checking", handler);

        return () => {
            ipcRenderer.removeListener("launcher:checking", handler);
        };
    },

    onPatching: (cb: () => void) => {
        const handler = () => cb();
        ipcRenderer.on("launcher:patching", handler);

        return () => {
            ipcRenderer.removeListener("launcher:patching", handler);
        };
    },

    onProgressBarVisible: (cb: (visible: boolean) => void) => {
        const handler = (_event: unknown, visible: boolean) => cb(visible);

        ipcRenderer.on("launcher:setProgressBarVisible", handler);

        return () => {
            ipcRenderer.removeListener("launcher:setProgressBarVisible", handler);
        };
    },

    onLaunchButton: (cb: (disabled: boolean, text?: string) => void) => {
        const handler = (_event: unknown, disabled: boolean, text?: string) => cb(disabled, text);

        ipcRenderer.on("launcher:useLaunchButton", handler);

        return () => {
            ipcRenderer.removeListener("launcher:useLaunchButton", handler);
        };
    },
});