/// <reference types="vite/client" />
export {};

type LauncherProgress = { progress: number; size: number; element: string };

declare global {
    interface Window {
        api: {
            minimize: () => Promise<void>;
            close: () => Promise<void>;
            minecraftLaunch: (memory: number) => Promise<void>;
            openGameDir: () => Promise<void>;

            getTotalRam: () => Promise<number>;

            onProgress: (cb: (data: LauncherProgress) => void) => () => void;
            onChecking: (cb: (data: LauncherProgress) => void) => () => void;
            onPatching: (cb: () => void) => () => void;
            onProgressBarVisible: (cb: (data: boolean) => void) => () => void;
            onLaunchButton: (cb: (disabled: boolean, text?: string) => void) => () => void;
        };
    }
}
