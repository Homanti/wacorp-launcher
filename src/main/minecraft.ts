import {Launch} from "minecraft-java-core";
import {app, BrowserWindow} from 'electron';
import path from "node:path"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import {LaunchOPTS} from "minecraft-java-core/build/Launch";
import {writeFile} from "node:fs/promises";
import {API_URL, SERVER_IP} from "../config/api.config";
import mc from "minecraftstatuspinger";
import MinecraftChecker from "./MinecraftChecker";
import log from "electron-log";
import {formatSpeed, formatTime} from "./utils/formatUtils";
import {existsSync} from "fs";

export type launchOptions = {
    username: string;
    accessToken?: string;
    uuid: string;
    dedicatedRam: number;
    hideLauncher: boolean;
}

class Minecraft {
    version: {mc: string, forge: string};
    minecraftPath: string;
    authLibDir: string;
    isMinecraftLaunched: boolean;
    private win: BrowserWindow;

    constructor(win: BrowserWindow,version = {mc: "1.20.1", forge: "47.4.13"}, minecraftPath = path.join(app.getPath('appData'), '.wacorp')) {
        this.version = version;
        this.minecraftPath = minecraftPath;
        this.win = win;
        this.authLibDir = path.join(this.minecraftPath, 'libraries', 'com', 'mojang', 'authlib', 'authlib-injector-1.2.7.jar');
        this.isMinecraftLaunched = false;
    }

    private sendToRenderer(channel: string, ...args: unknown[]) {
        if (!this.win.isDestroyed()) {
            this.win.webContents.send(channel, ...args);
        }
    }
    
    async launchMinecraft(launchOptions: launchOptions) {
        const username = launchOptions.username;
        const uuid = launchOptions.uuid;
        const accessToken = launchOptions.accessToken;

        const opt: LaunchOPTS = {
            timeout: 30000,
            path: this.minecraftPath,
            url: "https://raw.githubusercontent.com/Homanti/wacorp-assets/refs/heads/main/assets_manifest.json",
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
            ignored: ['loader', 'options.txt', 'saves', 'screenshots', 'saros_road_signs_mod', 'pfm', 'logs', 'emotes', 'defaultconfigs', 'config', 'shaderpacks'],

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

            JVM_ARGS: [`-javaagent:${this.authLibDir}=${API_URL}`]
        }

        const launch = new Launch();

        const isOptionsCreated = existsSync(path.join(this.minecraftPath, 'options.txt'));

        let lastProgressUpdate = 0;
        let lastCheckUpdate = 0;

        launch.on('progress', async (progress, size, element) => {
            const now = Date.now();

            if (now - lastProgressUpdate >= 100) {
                lastProgressUpdate = now;

                const percent = Number(((progress / size) * 100).toFixed(2));

                this.sendToRenderer("launcher:useProgressBar", true, `Установка игры: ${element}`, percent)
                this.sendToRenderer("launcher:useLaunchButton", true, "Установка...");
            }

            if (!isOptionsCreated) {
                const content = `resourcePacks:["vanilla","pointblank_resources","pfm-asset-resources","mod_resources","file/WacoRP Part 1.zip","file/WacoRP Part 2.zip","file/WacoRP Part 3.zip"]\nlang:ru_ru`;
                const ofContent = `ofShowGlErrors:false`;

                await writeFile(path.join(this.minecraftPath, 'options.txt'), content, 'utf8');
                await writeFile(path.join(this.minecraftPath, 'optionsof.txt'), ofContent, 'utf8');
            }
        });

        launch.on('speed', (speed) => {
            const formattedSpeed = formatSpeed(speed);
            this.sendToRenderer("launcher:setProgressBarSpeed", `Скорость: ${formattedSpeed}.`);
        })

        launch.on('estimated', (estimated) => {
            const formattedTime = formatTime(estimated);
            this.sendToRenderer("launcher:setProgressBarEstimated", `Осталось примерно ${formattedTime}.`);
        })

        launch.on('check', (progress, size, element) => {
            const now = Date.now();

            if (now - lastCheckUpdate >= 100) {
                lastCheckUpdate = now;

                const percent = Number(((progress / size) * 100).toFixed(2));

                this.sendToRenderer("launcher:useProgressBar", true, `Проверка файлов. ${element}`, percent)

                this.sendToRenderer("launcher:setProgressBarSpeed", null);
                this.sendToRenderer("launcher:setProgressBarEstimated", null);

                this.sendToRenderer("launcher:useLaunchButton", true, "Проверка файлов...");
            }
        });

        launch.on('extract', extract => {
            log.info(extract);
            this.sendToRenderer("launcher:useProgressBar", true, `Распаковка файлов...`, null)
            this.sendToRenderer("launcher:useLaunchButton", true, "Распаковка файлов...");
        });

        launch.on('patch', patch => {
            log.info(patch);

            this.sendToRenderer("launcher:setProgressBarSpeed", null);
            this.sendToRenderer("launcher:setProgressBarEstimated", null);

            this.sendToRenderer("launcher:useProgressBar", true, `Установка Forge`, null)
            this.sendToRenderer("launcher:useLaunchButton", true, "Установка Forge...");
        });

        launch.on('data', (e) => {
            if (!this.isMinecraftLaunched) {
                this.isMinecraftLaunched = true;

                this.sendToRenderer("launcher:useProgressBar", false);
                this.sendToRenderer("launcher:useLaunchButton", app.isPackaged, "Запущен");
                this.sendToRenderer("launcher:addNotification", "success", "Майнкрафт запущен");

                if (launchOptions.hideLauncher) {
                    this.win.hide();
                }
            }
            log.info(e);
        })

        launch.on('close', code => {
            log.info(code);
            this.isMinecraftLaunched = false;

            this.win.show();
            this.sendToRenderer("launcher:useLaunchButton", false, "Играть");
        });

        launch.on('error', err => {
            log.error(err);

            this.sendToRenderer("launcher:useLaunchButton", false, "Играть");
            this.sendToRenderer("launcher:addNotification", "error", "Неизвестная ошибка");

            this.win.show();
        });

        const checker = new MinecraftChecker(this.win, this.minecraftPath);

        await checker.checkMods();
        await checker.checkResourcePacks();
        await checker.checkPointBlank();

        this.sendToRenderer("launcher:useLaunchButton", true, "Запуск...");

        log.info('Launching minecraft...');
        await launch.Launch(opt);
    }

    async getServerStatus() {
        try {
            let result = await mc.lookup({ host: SERVER_IP, port: 25565 });

            if (result?.status?.players) {
                return result.status.players.online;
            } else {
                return false;
            }

        } catch {
            return false;
        }
    }
}

export default Minecraft;