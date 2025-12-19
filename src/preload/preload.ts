import { contextBridge, ipcRenderer } from 'electron';
console.log('PRELOAD LOADED, contextIsolated=', process.contextIsolated);

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    close: () => ipcRenderer.invoke('win:close'),
    minecraftLaunch: (memory: number) => ipcRenderer.invoke('launcher:launch', memory),
    openGameDir: () => ipcRenderer.invoke('launcher:openGameDir'),

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

    onLaunchButton: (cb: (disabled: boolean, text?: string) => void) => {
        const handler = (_event: unknown, disabled: boolean, text?: string) => cb(disabled, text);

        ipcRenderer.on("launcher:useLaunchButton", handler);

        return () => {
            ipcRenderer.removeListener("launcher:useLaunchButton", handler);
        };
    },
});