export async function validateSkinImage(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const { width, height } = img;
            const validSizes = [[64, 64], [64, 32]];

            const isValidSize = validSizes.some(([w, h]) => width === w && height === h);

            if (!isValidSize) {
                resolve({
                    valid: false,
                    error: `Скин должен быть 64x64 или 64x32 пикселей. Текущий размер: ${width}x${height}`
                });
                return;
            }

            resolve({ valid: true });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ valid: false, error: "Не удалось загрузить изображение" });
        };

        img.src = url;
    });
}