import { Client } from '@xhayper/discord-rpc';

const clientId = '1455754619933163684';

class DiscordRPCManager {
    private client: Client;
    private connected = false;
    private timestamp = Date.now();

    constructor() {
        this.client = new Client({ clientId });
    }

    async connect() {
        try {
            this.client.on('ready', () => {
                console.log('Discord RPC connected:', this.client.user?.username);
                this.connected = true;
                this.timestamp = Date.now();
                this.setIdleActivity();
            });

            this.client.on('disconnected', () => {
                console.log('Discord RPC disconnected');
                this.connected = false;
            });

            await this.client.login();
        } catch (error) {
            console.error('Failed to connect Discord RPC:', error);
        }
    }

    setIdleActivity() {
        if (!this.connected) return;

        this.client.user?.setActivity({
            details: 'В лаунчере',
            largeImageKey: 'icon',
            largeImageText: 'WacoRP',
            startTimestamp: this.timestamp,
            buttons: [
                { label: 'Присоединиться', url: 'https://discord.gg/v8BMjSt8aw' }
            ],
            instance: false,
        });
    }

    setPlayingActivity() {
        if (!this.connected) return;

        this.client.user?.setActivity({
            details: `В игре`,
            state: `🎄Отмечает новый год на WacoRP`,
            largeImageKey: 'icon',
            largeImageText: 'WacoRP',
            startTimestamp: this.timestamp,
            buttons: [
                { label: 'Присоединиться', url: 'https://discord.gg/v8BMjSt8aw' }
            ],
            instance: false
        });
    }

    clearActivity() {
        if (!this.connected) return;
        this.client.user?.clearActivity();
    }

    async disconnect() {
        if (this.connected) {
            await this.client.destroy();
            this.connected = false;
        }
    }
}

export const discordRPC = new DiscordRPCManager();