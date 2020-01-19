export function encodeToBase64(data) {
    return Buffer.from(data).toString('base64');
}