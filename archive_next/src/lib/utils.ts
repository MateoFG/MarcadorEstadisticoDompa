import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getContrastColor(hslColor: string): string {
  if (!hslColor) return 'hsl(var(--card-foreground))';

  try {
    const [h, s, l] = hslColor.split(' ').map(val => parseInt(val));

    // Formula to calculate luminance from HSL
    // First, convert HSL to RGB
    const s_dec = s / 100;
    const l_dec = l / 100;
    const c = (1 - Math.abs(2 * l_dec - 1)) * s_dec;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l_dec - c / 2;
    let r_prime = 0, g_prime = 0, b_prime = 0;

    if (h >= 0 && h < 60) { [r_prime, g_prime, b_prime] = [c, x, 0]; }
    else if (h >= 60 && h < 120) { [r_prime, g_prime, b_prime] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r_prime, g_prime, b_prime] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r_prime, g_prime, b_prime] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r_prime, g_prime, b_prime] = [x, 0, c]; }
    else if (h >= 300 && h < 360) { [r_prime, g_prime, b_prime] = [c, 0, x]; }

    const r = (r_prime + m);
    const g = (g_prime + m);
    const b = (b_prime + m);

    // Then, calculate luminance
    // Formula from WCAG
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return black or white depending on luminance
    // The threshold 0.5 is a common choice.
    return luminance > 0.4 ? 'hsl(var(--card-foreground))' : 'hsl(var(--primary-foreground))';
  } catch (error) {
    console.error("Error calculating contrast color, defaulting to dark.", error);
    return 'hsl(var(--card-foreground))';
  }
}

export const lightenHslColor = (hsl: string, lightenAmount: number, saturationAmount?: number): string => {
  if (!hsl) return '0 0% 0%';
  const [h, s, l] = hsl.split(' ').map(val => parseInt(val, 10));
  const newL = Math.max(0, Math.min(100, l + lightenAmount));
  const newS = saturationAmount !== undefined ? Math.max(0, Math.min(100, saturationAmount)) : s;
  return `${h} ${newS}% ${newL}%`;
};

export const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const hslToHex = (hsl: string): string => {
  if (!hsl) return '#000000';
  const [h, s, l] = hsl.split(' ').map(val => parseInt(val, 10));
  const sDecimal = s / 100;
  const lDecimal = l / 100;
  const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = lDecimal - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { [r, g, b] = [c, x, 0]; }
  else if (60 <= h && h < 120) { [r, g, b] = [x, c, 0]; }
  else if (120 <= h && h < 180) { [r, g, b] = [0, c, x]; }
  else if (180 <= h && h < 240) { [r, g, b] = [0, x, c]; }
  else if (240 <= h && h < 300) { [r, g, b] = [x, 0, c]; }
  else if (300 <= h && h < 360) { [r, g, b] = [c, 0, x]; }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

