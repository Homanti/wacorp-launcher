import {Launch, Mojang} from "minecraft-java-core";
import {app, BrowserWindow} from 'electron';
import path from "node:path"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {LaunchOPTS} from "minecraft-java-core/build/Launch";
import {readJsonFile, writeJsonFile} from "./utils/jsonUtils";
import downloadFile from "./utils/downloadFile";
import * as fs from 'node:fs/promises';

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
        const actualModsArray = await fetch(
            'https://raw.githubusercontent.com/Homanti/minecraft-assets/refs/heads/main/mods.json'
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
            const base = new URL('https://raw.githubusercontent.com/Homanti/minecraft-assets/refs/heads/main/mods/');
            const modUrl = new URL(encodeURIComponent(mod), base);

            try {
                await downloadFile(modUrl, path.join(modsDir, mod), (percent) => {
                    if (percent !== null) this.win.webContents.send("launcher:useProgressBar", true, `Установка модов ${mod}`, percent);
                });

                console.log("Downloaded missing mod:", mod);
            } catch (e) {
                console.log("Can't download missing mod: ", e);
            }
        }

        await writeJsonFile(path.join(modsDir, 'mods.json'), actualModsArray);
        this.win.webContents.send("launcher:useProgressBar", false);
    }

    async downloadRPIIfMissing() {

    }
    
    async launchMinecraft(memory: number) {
        let mc;
        mc = await Mojang.login('Homanti');

        const opt: LaunchOPTS = {
            timeout: 10000,
            path: this.minecraftPath,
            authenticator: mc,
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
            args: [],

            javaPath: null,
            java: true,


            screen: {
                width: null,
                height: null,
                fullscreen: null,
            },

            memory: {
                min: '1600M',
                max: memory + 'M',
            },
        }

        const launch = new Launch();

        let started = false;

        launch.on('extract', extract => {
            console.log(extract);
        });

        launch.on('progress', (progress, size, element) => {
            const percent = Number(((progress / size) * 100).toFixed(2));
            console.log(`Downloading ${element} ${percent}%`);

            this.win.webContents.send("launcher:useProgressBar", true, `Установка игры ${element}`, percent)
            this.win.webContents.send("launcher:useLaunchButton", true, "Установка...");
        });

        launch.on('check', (progress, size, element) => {
            const percent = Number(((progress / size) * 100).toFixed(2));
            console.log(`Checking ${element} ${percent}%`);

            this.win.webContents.send("launcher:useProgressBar", true, `Проверка файлов ${element}`, percent)
            this.win.webContents.send("launcher:useLaunchButton", true, "Проверка файлов...");
        });

        launch.on('patch', patch => {
            console.log(patch);

            this.win.webContents.send("launcher:useProgressBar", true, `Проверка файлов`, 99)
            this.win.webContents.send("launcher:useLaunchButton", true, "Проверка файлов...");
        });

        launch.on('data', (e) => {
            if (!started) {
                started = true;

                this.win.webContents.send("launcher:useProgressBar", false);
                this.win.webContents.send("launcher:useLaunchButton", true, "Запускается");
            }
            console.log(e);
        })

        launch.on('close', code => {
            console.log(code);
            started = false;

            this.win.webContents.send("launcher:useLaunchButton", false, "Играть");
        });

        launch.on('error', err => {
            console.log(err);
        });

        await this.downloadModsIfMissing()
        await launch.Launch(opt);
    }

}

export default Minecraft;