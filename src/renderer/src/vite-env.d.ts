/// <reference types="vite/client" />
export {};

declare global {
    interface Window {
        api: {
            minimize: () => Promise<void>;
            close: () => Promise<void>;
            minecraftLaunch: (memory: number) => Promise<void>;
            openGameDir: () => Promise<void>;

            reinstall: (what: "mods" | "resourcepacks") => Promise<void>;
            deleteGameDir: () => Promise<void>;

            getTotalRam: () => Promise<number>;

            onProgressBar: (cb: (isVisible: boolean, description?: string, percent?: number | null) => void) => () => void;
            onLaunchButton: (cb: (disabled: boolean, text?: string) => void) => () => void;
        };
    }
}
