import { vec3, Vec3 } from 'mv-redux';

function color(hex: string): Vec3 {
    let i = hex.startsWith('#') ? 1 : 0;
    const r = window.parseInt(hex.substring(i, i += 2), 16) / 0xFF;
    const g = window.parseInt(hex.substring(i, i += 2), 16) / 0xFF;
    const b = window.parseInt(hex.substring(i, i += 2), 16) / 0xFF;
    return vec3(r, g, b);
}

export const palette = [
    color('#F4F4F4'), // White
    color('#049EF4'), // Blue
    color('#04F49E'), // Turquoise
    color('#9E04F4'), // Purple
    color('#9EF404'), // Lime
    color('#F4049E'), // Pink
    color('#FF7F0B'), // Orange
    color('#9E9E9E'), // Gray
    color('#40D106'), // Green
];
