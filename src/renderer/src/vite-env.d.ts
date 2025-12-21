/// <reference types="vite/client" />
export {};

type launchOptions = {
    username: string;
    authToken: string;
    dedicatedRam: number;
}

declare global {
    interface Window {
        api: {
            minimize: () => Promise<void>;
            close: () => Promise<void>;
            minecraftLaunch: (launchOptions: launchOptions) => Promise<void>;
            openGameDir: () => Promise<void>;

            reinstall: (what: "mods" | "resourcepacks") => Promise<void>;
            deleteGameDir: () => Promise<void>;

            getTotalRam: () => Promise<number>;

            onProgressBar: (cb: (isVisible: boolean, description?: string, percent?: number | null) => void) => () => void;
            onLaunchButton: (cb: (disabled: boolean, text?: string) => void) => () => void;
        };
    }
}
