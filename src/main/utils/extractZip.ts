import * as fs from "node:fs";
import AdmZip from 'adm-zip';

async function extractZip(path: string, dest: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            if (!fs.existsSync(path)) {
                reject(new Error('Source file does not exist'));
                return;
            }

            const zip = new AdmZip(path);
            zip.extractAllTo(dest, true);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export default extractZip;