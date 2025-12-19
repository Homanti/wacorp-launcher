import * as https from 'node:https';
import * as http from 'node:http';
import * as fs from 'node:fs';
import { unlink } from 'node:fs/promises';

const redirectCodes = new Set([301, 302, 303, 307, 308]);

type ProgressCb = (percent: number | null, receivedBytes: number, totalBytes: number | null) => void;

export default function downloadFile(
    url: URL,
    filePath: string,
    onProgress?: ProgressCb,
    maxRedirects = 5
): Promise<void> {
    return new Promise((resolve, reject) => {
        const proto = url.protocol === 'https:' ? https : http;
        const file = fs.createWriteStream(filePath);

        const fail = async (err: unknown) => {
            await unlink(filePath);
            reject(err);
        };

        const req = proto.get(url, (res) => {
            const status = res.statusCode ?? 0;

            if (redirectCodes.has(status) && res.headers.location) {
                if (maxRedirects <= 0) {
                    res.resume();
                    file.close();
                    void fail(new Error('Too many redirects'));
                    return;
                }
                const nextUrl = new URL(res.headers.location, url);
                res.resume();
                file.close();
                downloadFile(nextUrl, filePath, onProgress, maxRedirects - 1).then(resolve, reject);
                return;
            }

            if (status !== 200) {
                res.resume();
                file.close();
                void fail(new Error(`Failed to download: ${status}`));
                return;
            }

            const totalHeader = res.headers['content-length'];
            const total = typeof totalHeader === 'string' ? Number(totalHeader) : null;

            let received = 0;

            res.on('data', (chunk: Buffer) => {
                received += chunk.length;
                if (onProgress) {
                    const percent = total ? Math.round((received / total) * 100) : null;
                    onProgress(percent, received, total);
                }
            });

            res.pipe(file);
        });

        req.on('error', (err) => {
            file.close();
            void fail(err);
        });

        file.on('finish', () => {
            file.close();
            resolve();
        });

        file.on('error', (err) => {
            req.destroy(err);
            file.close();
            void fail(err);
        });
    });
}