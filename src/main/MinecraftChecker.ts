import path from "node:path";
import fs from "node:fs/promises";
import {readJsonFile, writeJsonFile} from "./utils/jsonUtils";
import {app, BrowserWindow} from "electron";
import log from "electron-log";

type AssetFile = {
    path: string;
    hash: string;
    size: number;
    url: string;
}

class MinecraftChecker {
    private win: Electron.BrowserWindow;
    private minecraftPath: string;

    constructor(win: BrowserWindow, minecraftPath = path.join(app.getPath('appData'), '.wacorp')) {
        this.win = win;
        this.minecraftPath = minecraftPath;
    }

    async checkMods() {
        const actualAssetsArray = await fetch(
            'https://raw.githubusercontent.com/Homanti/wacorp-assets/refs/heads/main/assets_manifest.json'
        ).then(res => res.json()) as AssetFile[];

        const actualModsArray = actualAssetsArray.filter(obj => obj.path.startsWith('mods/'));

        const manifestPath = path.join(this.minecraftPath, 'assets_manifest.json');

        const localAssetsArray = await readJsonFile<AssetFile[]>(manifestPath)
            .catch(() => []);

        const localModsArray = localAssetsArray.filter(obj => obj.path.startsWith('mods/'));

        if (!actualModsArray.length) return;

        const actualModsMap = new Map(actualModsArray.map(m => [m.path, m]));

        const extraMods = localModsArray.filter(m => !actualModsMap.has(m.path));

        for (const mod of extraMods) {
            try {
                const fullPath = path.join(this.minecraftPath, mod.path);
                await fs.unlink(fullPath);
                log.info("Deleted extra mod:", mod.path);
            } catch (e) {
                log.error("Can't delete extra mod:", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка удаления " + mod.path);
            }
        }

        const updatedAssetsArray = [
            ...localAssetsArray.filter(obj => !obj.path.startsWith('mods/')),
            ...actualModsArray
        ];

        await writeJsonFile(manifestPath, updatedAssetsArray);
    }

    async checkResourcePacks() {
        const actualAssetsArray = await fetch(
            'https://raw.githubusercontent.com/Homanti/wacorp-assets/refs/heads/main/assets_manifest.json'
        ).then(res => res.json()) as AssetFile[];

        const actualResourcePacksArray = actualAssetsArray.filter(obj => obj.path.startsWith('resourcepacks/'));

        const manifestPath = path.join(this.minecraftPath, 'assets_manifest.json');

        const localAssetsArray = await readJsonFile<AssetFile[]>(manifestPath)
            .catch(() => []);

        const localResourcePacksArray = localAssetsArray.filter(obj => obj.path.startsWith('resourcepacks/'));

        if (!actualResourcePacksArray.length) return;

        const actualResourcePacksMap = new Map(actualResourcePacksArray.map(rp => [rp.path, rp]));

        const extraResourcePacks = localResourcePacksArray.filter(rp => !actualResourcePacksMap.has(rp.path));

        for (const rp of extraResourcePacks) {
            try {
                const fullPath = path.join(this.minecraftPath, rp.path);
                await fs.unlink(fullPath);
                log.info("Deleted extra resource pack:", rp.path);
            } catch (e) {
                log.error("Can't delete extra resource pack:", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка удаления " + rp.path);
            }
        }

        const updatedAssetsArray = [
            ...localAssetsArray.filter(obj => !obj.path.startsWith('resourcepacks/')),
            ...actualResourcePacksArray
        ];

        await writeJsonFile(manifestPath, updatedAssetsArray);
    }

    async checkPointBlank() {
        const actualAssetsArray = await fetch(
            'https://raw.githubusercontent.com/Homanti/wacorp-assets/refs/heads/main/assets_manifest.json'
        ).then(res => res.json()) as AssetFile[];

        const actualPointBlankArray = actualAssetsArray.filter(obj => obj.path.startsWith('pointblank/'));

        const manifestPath = path.join(this.minecraftPath, 'assets_manifest.json');

        const localAssetsArray = await readJsonFile<AssetFile[]>(manifestPath)
            .catch(() => []);

        const localPointBlankArray = localAssetsArray.filter(obj => obj.path.startsWith('pointblank/'));

        if (!actualPointBlankArray.length) return;

        const actualPointBlankMap = new Map(actualPointBlankArray.map(pb => [pb.path, pb]));

        const extraPointBlank = localPointBlankArray.filter(pb => !actualPointBlankMap.has(pb.path));

        for (const pb of extraPointBlank) {
            try {
                const fullPath = path.join(this.minecraftPath, pb.path);
                await fs.unlink(fullPath);
                log.info("Deleted extra pointblank file:", pb.path);
            } catch (e) {
                log.error("Can't delete extra pointblank file:", e);
                this.win.webContents.send("launcher:addNotification", "error", "Ошибка удаления " + pb.path);
            }
        }

        const updatedAssetsArray = [
            ...localAssetsArray.filter(obj => !obj.path.startsWith('pointblank/')),
            ...actualPointBlankArray
        ];

        await writeJsonFile(manifestPath, updatedAssetsArray);
    }
}

export default MinecraftChecker;