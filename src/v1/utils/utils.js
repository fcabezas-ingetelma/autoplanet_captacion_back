export function encodeToBase64(data) {
    return Buffer.from(data).toString('base64');
}

export function randomTokenGenerator() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}