export const extractHead = async (skinUrl: string, outputSize: number = 64): Promise<string> => {
    const skinImg = new Image();
    skinImg.crossOrigin = 'anonymous';
    skinImg.src = skinUrl;

    await new Promise<string>((resolve, reject) => {
        skinImg.onload = () => resolve('loaded');
        skinImg.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    const headX = 8;
    const headY = 8;
    const headWidth = 8;
    const headHeight = 8;

    const overlayX = 40;
    const overlayY = 8;
    const overlayWidth = 8;
    const overlayHeight = 8;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(skinImg, headX, headY, headWidth, headHeight, 0, 0, outputSize, outputSize);

    if (skinImg.height === 64) {
        ctx.drawImage(skinImg, overlayX, overlayY, overlayWidth, overlayHeight, 0, 0, outputSize, outputSize);
    }

    return canvas.toDataURL('image/png');
};