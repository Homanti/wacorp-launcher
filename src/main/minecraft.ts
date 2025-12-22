import {Launch} from "minecraft-java-core";
import {app, BrowserWindow} from 'electron';
import path from "node:path"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {LaunchOPTS} from "minecraft-java-core/build/Launch";
import {readJsonFile, writeJsonFile} from "./utils/jsonUtils";
import downloadFile from "./utils/downloadFile";
import * as fs from 'node:fs/promises';
import extractZip from "./utils/extractZip";
import {writeFile} from "node:fs/promises";

export type launchOptions = {
    username: string;
    accessToken: string;
    uuid: string;
    dedicatedRam: number;
}

class Minecraft {
    version: {mc: string, forge: string};
    minecraftPath: string;
    private win: BrowserWindow;

    constructor(win: BrowserWindow,version = {mc: "1.20.1", forge: "47.4.13"}, minecraftPath = path.join(app.getPath('appData'), '.wacorp')) {
        this.version = version;
        this.minecraftPath = minecraftPath;
        this.win = win;
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
            }
        }

        await writeJsonFile(path.join(modsDir, 'mods.json'), actualModsArray);

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
                }
            }

            try {
                await downloadFile(new URL("https://github.com/Homanti/wacorp-assets/raw/refs/heads/main/WacoRP%20resourcepacks.zip"), path.join(rpDir, "resourcepacks.zip"), (percent) => {
                    if (percent !== null) {
                        this.win.webContents.send("launcher:useLaunchButton", true, "Установка ресурспака.");
                        this.win.webContents.send("launcher:useProgressBar", true, `Установка ресурспака`, percent);
                    }
                })
            } catch (e) {
                console.error("Can't download resourcepack: ", e);
            }

            try {
                this.win.webContents.send("launcher:useProgressBar", true, `Распаковка`, null);
                await extractZip(path.join(rpDir, "resourcepacks.zip"), rpDir);
                console.log("Extracted resourcepacks.zip");

                await fs.unlink(path.join(rpDir, "resourcepacks.zip"));
                newAssetsVersion.rp_version = rpActual;
            } catch (e) {
                console.error("Can't extract resourcepacks.zip: ", e);
            }

        } if (pbActual !== pbLocal || !isPbExists) {
            for (const pb of pbFilesNames) {
                if (!pbDiskSet.has(pb)) continue;

                try {
                    await fs.unlink(path.join(pbDir, pb));
                    console.log("Deleted pointblank pack: ", pb);
                } catch (e) {
                    console.error("Can't delete pointblank pack:", e);
                }
            }

            try {
                await downloadFile(new URL("https://github.com/Homanti/wacorp-assets/raw/refs/heads/main/pointblank.zip"), path.join(pbDir, "pointblank.zip"), (percent) => {
                    if (percent !== null) {
                        this.win.webContents.send("launcher:useLaunchButton", true, "Установка ресурспака.");
                        this.win.webContents.send("launcher:useProgressBar", true, `Установка ресурспака`, percent);
                    }
                })
            } catch (e) {
                console.error("Can't download pointblank pack: ", e);
            }

            try {
                this.win.webContents.send("launcher:useProgressBar", true, `Распаковка`, null);
                await extractZip(path.join(pbDir, "pointblank.zip"), pbDir);
                console.log("Extracted pointblank.zip");

                await fs.unlink(path.join(pbDir, "pointblank.zip"));
                newAssetsVersion.pointblank_version = pbActual;
            } catch (e) {
                console.error("Can't extract pointblank.zip: ", e);
            }
        }

        await writeJsonFile(path.join(this.minecraftPath, 'wacorp-assets-version.json'), newAssetsVersion);

        this.win.webContents.send("launcher:useProgressBar", false);
        this.win.webContents.send("launcher:useLaunchButton", false, "Играть");
    }
    
    async launchMinecraft(launchOptions: launchOptions) {
        const username = launchOptions.username;
        const uuid = launchOptions.uuid;
        const accessToken = launchOptions.accessToken;

        const authLibDir = path.join(this.minecraftPath, 'mods', 'authlib-injector-1.2.7.jar');

        const opt: LaunchOPTS = {
            timeout: 10000,
            path: this.minecraftPath,
            authenticator: {
                access_token: accessToken,
                client_token: accessToken,
                uuid: uuid,
                name: username,
                user_properties: '{}',
                meta: {
                    online: true,
                    type: 'Mojang'
                }
            },
            version: this.version.mc,
            detached: false,
            intelEnabledMac: true,
            downloadFileMultiple: 10,

            loader: {
                type: 'forge',
                build: `${this.version.mc}-${this.version.forge}`,
                enable: true
            },

            verify: false,
            ignored: ['loader', 'options.txt'],

            javaPath: null,
            java: true,

            screen: {
                width: null,
                height: null,
                fullscreen: null,
            },

            memory: {
                min: '1600M',
                max: launchOptions.dedicatedRam + 'M',
            },

            JVM_ARGS: [`-javaagent:${authLibDir}=https://wacorp-api-production.up.railway.app`]
        }

        const launch = new Launch();

        let started = false;
        let isOptionsCreated = false;

        launch.on('extract', extract => {
            console.log(extract);
        });

        launch.on('progress', async (progress, size, element) => {
            const percent = Number(((progress / size) * 100).toFixed(2));

            this.win.webContents.send("launcher:useProgressBar", true, `Установка игры. ${element}`, percent)
            this.win.webContents.send("launcher:useLaunchButton", true, "Установка...");

            if (!isOptionsCreated) {
                isOptionsCreated = true;

                const content = `resourcePacks:["vanilla","pointblank_resources","pfm-asset-resources","mod_resources","file/WacoRP Part 1.zip","file/WacoRP Part 2.zip","file/WacoRP Part 3.zip"]\nlang:ru_ru`;

                await writeFile(path.join(this.minecraftPath, 'options.txt'), content, 'utf8');
            }
        });

        launch.on('check', (progress, size, element) => {
            const percent = Number(((progress / size) * 100).toFixed(2));

            this.win.webContents.send("launcher:useProgressBar", true, `Проверка файлов. ${element}`, percent)
            this.win.webContents.send("launcher:useLaunchButton", true, "Проверка файлов...");
        });

        launch.on('patch', patch => {
            console.log(patch);

            this.win.webContents.send("launcher:useProgressBar", true, `Проверка файлов`, null)
            this.win.webContents.send("launcher:useLaunchButton", true, "Проверка файлов...");
        });

        launch.on('data', (e) => {
            if (!started) {
                started = true;

                this.win.webContents.send("launcher:useProgressBar", false);
                this.win.webContents.send("launcher:useLaunchButton", true, "Запущен");
            }
            console.log(e);
        })

        launch.on('close', code => {
            console.log(code);
            started = false;

            this.win.webContents.send("launcher:useLaunchButton", false, "Играть");
        });

        launch.on('error', err => {
            console.error(err);

            this.win.webContents.send("launcher:useLaunchButton", false, "Играть");
        });

        await this.downloadModsIfMissing()
        await this.downloadRPIIfMissing()

        this.win.webContents.send("launcher:useLaunchButton", true, "Запуск...");

        await launch.Launch(opt);
    }

    async reinstall(what: "mods" | "resourcepacks") {
        if (what === "mods") {
            const modsDir = path.join(this.minecraftPath, 'mods');
            await fs.rm(modsDir, {recursive: true, force: true}).catch(() => {
                console.error("Can't delete mods dir");
            })
            await this.downloadModsIfMissing()

        } else if (what === "resourcepacks") {
            const rpDir = path.join(this.minecraftPath, 'resourcepacks');
            const pbDir = path.join(this.minecraftPath, 'pointblank');

            await fs.rm(rpDir, {recursive: true, force: true}).catch(() => {
                console.error("Can't delete resourcepacks dir");
            })

            await fs.rm(pbDir, {recursive: true, force: true}).catch(() => {
                console.error("Can't delete pointblank dir");
            })

            await this.downloadRPIIfMissing()
        }
    }
}

export default Minecraft;