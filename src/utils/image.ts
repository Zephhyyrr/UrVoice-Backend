import os from "os";
import path from "path";

function getLocalIp(): string {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        if (!["Wi-Fi", "Ethernet", "wlan0", "eth0"].includes(name)) continue;

        for (const iface of interfaces[name]!) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }

    return "localhost";
}

const baseImageUrl = `http://${getLocalIp()}:3000/uploads`;

export function getImageUrl(filename: string | null) {
    if (!filename) return null;
    return `${baseImageUrl}/${filename}`;
}

export const uploadsFolder = path.join(__dirname, "../../public/uploads");
