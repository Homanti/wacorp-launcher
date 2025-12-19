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
        let settled = false;

        const done = (err?: unknown) => {
            if (settled) return;
            settled = true;
            if (err) reject(err);
            else resolve();
        };

        const proto = url.protocol === 'https:' ? https : http;

        const req = proto.get(url, (res) => {
            const status = res.statusCode ?? 0;

            if (redirectCodes.has(status) && res.headers.location) {
                res.resume();
                if (maxRedirects <= 0) return done(new Error('Too many redirects'));
                const nextUrl = new URL(res.headers.location, url);
                downloadFile(nextUrl, filePath, onProgress, maxRedirects - 1).then(() => done(), done);
                return;
            }

            if (status !== 200) {
                res.resume();
                return done(new Error(`Failed to download: ${status}`));
            }

            const file = fs.createWriteStream(filePath);

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

            file.on('error', async (err) => {
                res.destroy();
                try { await unlink(filePath); } catch {console.error(err)}
                done(err);
            });

            file.on('close', () => done());

            res.on('error', async (err) => {
                try { await unlink(filePath); } catch {console.error(err)}
                done(err);
            });

            res.pipe(file);
        });

        req.on('error', async (err) => {
            try { await unlink(filePath); } catch {console.error(err)}
            done(err);
        });
    });
}