import nbt from 'prismarine-nbt';
import fs from 'fs/promises';
import path from 'path';

interface ServerEntry {
    name: string;
    ip: string;
}

async function createServersDat(servers: ServerEntry[], outputPath: string): Promise<void> {
    const serversList = servers.map(server => ({
        name: nbt.string(server.name),
        ip: nbt.string(server.ip),
        icon: nbt.string(''),
        acceptTextures: nbt.byte(1),
        resourcePackPolicy: nbt.byte(0)
    }));

    const serversData = {
        type: 'compound' as const,
        name: '',
        value: {
            servers: {
                type: 'list' as const,
                value: {
                    type: 'compound' as const,
                    value: serversList
                }
            }
        }
    };

    const buffer = nbt.writeUncompressed(serversData, 'big');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    await fs.writeFile(outputPath, buffer);
}

export default createServersDat;