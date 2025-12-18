import {Launch, Mojang} from "minecraft-java-core";
import {app, BrowserWindow} from 'electron';
import path from "node:path"

class Minecraft {
    version: {mc: string, forge: string};
    minecraftPath: string;
    private win: BrowserWindow;

    constructor(win: BrowserWindow,version = {mc: "1.20.1", forge: "47.4.13"}, minecraftPath = path.join(app.getPath('appData'), '.wacorp')) {
        this.version = version;
        this.minecraftPath = minecraftPath;
        this.win = win;
    }
    
    async launchMinecraft(memory: number) {
        const launch = new Launch();
        let mc;

        mc = await Mojang.login('Homanti');
        
        const opt  = {
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

            // GAME_ARGS: ['--quickPlayMultiplayer "localhost:25565"']
        }

        let started = false;

        launch.on('extract', extract => {
            console.log(extract);
        });

        let lastSent = 0;

        launch.on('progress', (progress, size, element) => {
            console.log(`Downloading ${element} ${Math.round((progress / size) * 100)}%`);
            const now = Date.now();
            if (now - lastSent < 150) return;

            lastSent = now;
            this.win.webContents.send("launcher:progress", { progress, size, element });
        });

        launch.on('check', (progress, size, element) => {
            console.log(`Checking ${element} ${Math.round((progress / size) * 100)}%`);
            const now = Date.now();
            if (now - lastSent < 150) return;

            lastSent = now;
            this.win.webContents.send("launcher:checking", { progress, size, element });
        });

        launch.on('patch', patch => {
            const now = Date.now();
            if (now - lastSent < 150) return;

            lastSent = now;
            this.win.webContents.send("launcher:patching");
            console.log(patch);
        });

        launch.on('data', (e) => {
            if (!started) {
                started = true;
                this.win.webContents.send("launcher:setProgressBarVisible", false);
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await launch.Launch(opt);
    }

}

export default Minecraft;