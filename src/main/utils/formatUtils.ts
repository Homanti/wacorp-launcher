export function formatSpeed(bytesPerSecond: number): string {
    const mbPerSecond = bytesPerSecond / (1024 * 1024);

    if (mbPerSecond < 1) {
        const kbPerSecond = bytesPerSecond / 1024;
        return `${kbPerSecond.toFixed(2)} KB/s`;
    } else {
        return `${mbPerSecond.toFixed(2)} MB/s`;
    }
}

export function formatTime(seconds: number): string {
    if (seconds < 0 || !isFinite(seconds)) {
        return "Вычисление...";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];

    if (hours > 0) {
        const hourWord = hours === 1 ? 'час' : (hours >= 2 && hours <= 4) ? 'часа' : 'часов';
        parts.push(`${hours} ${hourWord}`);
    }

    if (minutes > 0) {
        const minuteWord = minutes === 1 ? 'минута' : (minutes >= 2 && minutes <= 4) ? 'минуты' : 'минут';
        parts.push(`${minutes} ${minuteWord}`);
    }

    if (secs > 0 || parts.length === 0) {
        const secondWord = secs === 1 ? 'секунда' : (secs >= 2 && secs <= 4) ? 'секунды' : 'секунд';
        parts.push(`${secs} ${secondWord}`);
    }

    return parts.join(', ');
}

