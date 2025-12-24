import path from "node:path";
import fs from "node:fs/promises";
import {readJsonFile, writeJsonFile} from "./utils/jsonUtils";
import {app, BrowserWindow} from "electron";
import downloadFile from "./utils/downloadFile";
import extractZip from "./utils/extractZip";

class MinecraftDownloader {
    private win: Electron.BrowserWindow;
    private minecraftPath: string;

    constructor(win: BrowserWindow, minecraftPath = path.join(app.getPath('appData'), '.wacorp')) {
        this.win = win;
        this.minecraftPath = minecraftPath;
    }

    async downloadModsIfMissing() {
        const actualModsArray = await fetch('https://raw.githubusercontent.com/Homanti/wacorp-assets/refs/heads/main/mods.json'
        ).then(res => res.json());

        const modsDir = path.join(this.minecraftPath, 'mods');

        const modsArray = await readJsonFile<{ mods: string[] }>(path.join(modsDir, 'mods.json'))
            .catch(() => ({ mods: [] }));

        const actual = actualModsArray.mods as string[];
        const local = (modsArray.mods ?? []) as string[];

        if (!actual.length) return;

        const diskFiles = await fs.readdir(modsDir).catch(() => [] as string[]);
        const diskSet = new Set(diskFiles);

        const actualSet = new Set(actual);

        const missing = actual.filter(m => !diskSet.has(m));
        const extra = local.filter(m => !actualSet.has(m));

        if (missing.length > 0) this.win.webContents.send("launcher:addNotification", "info", "Установка модов");

        let success = true

        try {
            await fs.mkdir(modsDir, { recursive: true });
            console.log("Created mods dir");
        } catch (e) {
            console.log("Can't create mods dir: ", e);
        }

        for (const mod of extra) {
            try {
                await fs.unlink(path.join(modsDir, mod));
                console.log("Deleted extra mod:", mod);
            } catch (e) {
                console.log("Can't delete extra mod:", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка удаление " + mod);
            }
        }

        for (const mod of missing) {
            const base = new URL('https://pub-667cb3e69b324e049e8d10959a1d5bb9.r2.dev/');
            const modUrl = new URL(encodeURIComponent(mod), base);

            try {
                this.win.webContents.send("launcher:useLaunchButton", true, "Установка модов...");

                await downloadFile(modUrl, path.join(modsDir, mod), (percent) => {
                    if (percent !== null) this.win.webContents.send("launcher:useProgressBar", true, `Установка модов. ${mod}`, percent);
                });

                console.log("Downloaded missing mod:", mod);
            } catch (e) {
                console.error("Can't download missing mod: ", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка во время установки мода " + mod);
                success = false;
            }
        }

        await writeJsonFile(path.join(modsDir, 'mods.json'), actualModsArray);

        if (success && missing.length > 0) this.win.webContents.send("launcher:addNotification", "success", "Моды успешно установлены!");
        this.win.webContents.send("launcher:useProgressBar", false);
        this.win.webContents.send("launcher:useLaunchButton", false, "Играть");
    }

    async downloadRPIIfMissing() {
        const actualAssetsJson = await fetch('https://pastebin.com/raw/70N3V9Nj'
        ).then(res => res.json());

        const rpDir = path.join(this.minecraftPath, 'resourcepacks');
        const pbDir = path.join(this.minecraftPath, 'pointblank');

        const localAssetsJson = await readJsonFile<{rp_version: number, pointblank_version: number}>(path.join(this.minecraftPath, 'wacorp-assets-version.json'))
            .catch(() => ({ rp_version: null, pointblank_version: null }));

        const rpActual = actualAssetsJson.rp_version;
        const rpLocal = localAssetsJson.rp_version;

        const pbActual = actualAssetsJson.pointblank_version;
        const pbLocal = localAssetsJson.pointblank_version;

        const rpFilesNames = actualAssetsJson.rp_files as string[];
        const pbFilesNames = actualAssetsJson.pb_files as string[];

        const rpDiskFiles = await fs.readdir(rpDir).catch(() => [] as string[]);
        const rpDiskSet = new Set(rpDiskFiles);

        const pbDiskFiles = await fs.readdir(pbDir).catch(() => [] as string[]);
        const pbDiskSet = new Set(pbDiskFiles);

        const isRpExists = rpFilesNames.every(rp => rpDiskSet.has(rp));
        const isPbExists = pbFilesNames.every(pb => pbDiskSet.has(pb));

        if (rpActual === rpLocal && pbActual === pbLocal && isRpExists && isPbExists) return;

        try {
            await fs.mkdir(rpDir, { recursive: true });
            await fs.mkdir(pbDir, { recursive: true });
            console.log("Created resourcepack and pointblank dir");
        } catch (e) {
            console.error("Can't create resourcepack dir: ", e);
        }

        const newAssetsVersion = {rp_version: rpLocal, pointblank_version: pbLocal};

        if (rpActual !== rpLocal || !isRpExists) {
            for (const rp of rpFilesNames) {
                if (!rpDiskSet.has(rp)) continue;

                try {
                    await fs.unlink(path.join(rpDir, rp));
                    console.log("Deleted resourcepack: ", rp);
                } catch (e) {
                    console.error("Can't delete resourcepack:", e);
                    this.win.webContents.send("launcher:addNotification", "error", "Ошибка удаление ресурс пака " + rp);
                }
            }

            try {
                this.win.webContents.send("launcher:useLaunchButton", true, "Установка ресурспака.");
                this.win.webContents.send("launcher:addNotification", "info", "Установка ресурс пака");

                await downloadFile(new URL("https://github.com/Homanti/wacorp-assets/raw/refs/heads/main/WacoRP%20resourcepacks.zip"), path.join(rpDir, "resourcepacks.zip"), (percent) => {
                    if (percent !== null) {
                        this.win.webContents.send("launcher:useProgressBar", true, `Установка ресурспака`, percent);
                    }
                })

            } catch (e) {
                console.error("Can't download resourcepack: ", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка во время установки ресурс пака");
            }

            try {
                this.win.webContents.send("launcher:useProgressBar", true, `Распаковка`, null);
                await extractZip(path.join(rpDir, "resourcepacks.zip"), rpDir);
                console.log("Extracted resourcepacks.zip");

                await fs.unlink(path.join(rpDir, "resourcepacks.zip"));
                newAssetsVersion.rp_version = rpActual;
                this.win.webContents.send("launcher:addNotification", "success", "Ресурс пак успешно установлен!")
            } catch (e) {
                console.error("Can't extract resourcepacks.zip: ", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка во время распаковки resourcepacks.zip");
            }

        } if (pbActual !== pbLocal || !isPbExists) {
            for (const pb of pbFilesNames) {
                if (!pbDiskSet.has(pb)) continue;

                try {
                    await fs.unlink(path.join(pbDir, pb));
                    console.log("Deleted pointblank pack: ", pb);
                } catch (e) {
                    console.error("Can't delete pointblank pack:", e);
                    this.win.webContents.send("launcher:addNotification", "error", "Ошибка удаление pointblank.zip");
                }
            }

            try {
                await downloadFile(new URL("https://github.com/Homanti/wacorp-assets/raw/refs/heads/main/pointblank.zip"), path.join(pbDir, "pointblank.zip"), (percent) => {
                    if (percent !== null) {
                        this.win.webContents.send("launcher:useLaunchButton", true, "Установка pointblank паков.");
                        this.win.webContents.send("launcher:useProgressBar", true, `Установка pointblank паков`, percent);
                    }
                })
            } catch (e) {
                console.error("Can't download pointblank pack: ", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка во время установки pointblank.zip");
            }

            try {
                this.win.webContents.send("launcher:useProgressBar", true, `Распаковка`, null);
                await extractZip(path.join(pbDir, "pointblank.zip"), pbDir);
                console.log("Extracted pointblank.zip");

                await fs.unlink(path.join(pbDir, "pointblank.zip"));
                newAssetsVersion.pointblank_version = pbActual;
                this.win.webContents.send("launcher:addNotification", "success", "Pointblank паки успешно установлены!")
            } catch (e) {
                console.error("Can't extract pointblank.zip: ", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка во время распаковки pointblank.zip");
            }
        }

        await writeJsonFile(path.join(this.minecraftPath, 'wacorp-assets-version.json'), newAssetsVersion);

        this.win.webContents.send("launcher:useProgressBar", false);
        this.win.webContents.send("launcher:useLaunchButton", false, "Играть");
    }
}

export default MinecraftDownloader;