/// <reference types="vite/client" />
export {};

type launchOptions = {
    username: string;
    accessToken: string;
    uuid: string;
    dedicatedRam: number;
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
            deleteGameDir: () => Promise<void>;

            getTotalRam: () => Promise<number>;

            onProgressBar: (cb: (isVisible: boolean, description?: string, percent?: number | null) => void) => () => void;
            onLaunchButton: (cb: (disabled: boolean, text?: string) => void) => () => void;
            onAddNotification: (cb: (type: "success" | "info" | "error", text: string) => void) => () => void;
        };
    }
}
