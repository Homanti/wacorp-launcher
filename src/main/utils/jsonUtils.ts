import { readFile, writeFile, mkdir } from 'node:fs/promises';
import * as path from 'node:path';

export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    const text = await readFile(filePath, 'utf8');
    return JSON.parse(text) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
    await mkdir(path.dirname(filePath), { recursive: true });
    const json = JSON.stringify(data, null, 2);
    await writeFile(filePath, json, 'utf8');
}