/// <reference types="vite/client" />
export {};

type launchOptions = {
    username: string;
    accessToken?: string;
    uuid: string;
    dedicatedRam: number;
    hideLauncher: boolean;
}

export interface UpdateFileInfo {
    url: string;
    sha512: string;
    size: number;
}

export interface UpdateInfo {
    version: string;
    releaseDate?: string;
    files?: UpdateFileInfo[];
}

declare global {
    interface Window {
        api: {
            minimize: () => Promise<void>;
            close: () => Promise<void>;

            minecraftLaunch: (launchOptions: launchOptions) => Promise<void>;
            openGameDir: () => Promise<void>;

            getServerStatus: () => Promise<number | boolean>;

            delete: (what: "minecraft" | "mods" | "resourcepacks") => Promise<void>;
            updateSkin: () => Promise<void>;

            getTotalRam: () => Promise<number>;

            onProgressBar: (callback: (isVisible: boolean, description?: string, percent?: number) => void) => () => void;
            onProgressBarSpeed: (callback: (speed?: string) => void) => () => void;
            onProgressBarEstimated: (callback: (estimated?: string) => void) => () => void;

            onLaunchButton: (callback: (disabled: boolean, text?: string) => void) => () => void;
            onAddNotification: (callback: (type: "success" | "info" | "error", text: string) => void) => () => void;
        };

        updater: {
            checkForUpdates: () => Promise<{ available: boolean; updateInfo?: UpdateInfo }>;
            downloadUpdate: () => Promise<void>;

            quitAndInstall: () => Promise<void>;

            onCheckingForUpdate: (callback: () => void) => () => void;
            onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
            onUpdateNotAvailable: (callback: () => void) => () => void;

            onDownloadProgress: (callback: (progress: DownloadProgress) => void) => () => void;
            onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;

            onError: (callback: (error: string) => void) => () => void;
        };
    }
}
