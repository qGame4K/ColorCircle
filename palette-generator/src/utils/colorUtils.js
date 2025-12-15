// ============================================
// src/utils/colorUtils.js
// ============================================
// Утилиты для работы с цветами

/**
 * Преобразование HEX в RGB
 * @param {string} hex - Цвет в формате #RRGGBB
 * @returns {object} {r, g, b}
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Преобразование RGB в HEX
 * @param {number} r, g, b - Значения цветов (0-255)
 * @returns {string} Цвет в формате #RRGGBB
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Преобразование HEX в HSL
 * @param {string} hex - Цвет в формате #RRGGBB
 * @returns {object} {h, s, l}
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Преобразование HSL в HEX
 * @param {number} h, s, l - Значения (h: 0-360, s: 0-100, l: 0-100)
 * @returns {string} Цвет в формате #RRGGBB
 */
export function hslToHex(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return rgbToHex(
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  );
}

/**
 * Генерация случайного HEX цвета
 * @returns {string} Случайный цвет #RRGGBB
 */
export function generateRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}

/**
 * Получить название цвета на основе HEX (примерное)
 * @param {string} hex - Цвет в формате #RRGGBB
 * @returns {string} Приблизительное название цвета
 */
export function getColorName(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return 'Unknown';

  const h = hsl.h;
  const s = hsl.s;
  const l = hsl.l;

  if (s < 10) {
    if (l < 10) return 'Black';
    if (l > 90) return 'White';
    return 'Gray';
  }

  if (h < 15 || h >= 345) return 'Red';
  if (h < 45) return 'Orange';
  if (h < 65) return 'Yellow';
  if (h < 150) return 'Green';
  if (h < 200) return 'Cyan';
  if (h < 260) return 'Blue';
  if (h < 290) return 'Purple';
  if (h < 345) return 'Pink';

  return 'Unknown';
}

/**
 * Проверка - светлый или тёмный цвет
 * @param {string} hex - Цвет в формате #RRGGBB
 * @returns {boolean} true если светлый, false если тёмный
 */
export function isLightColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  // Формула яркости по W3C
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Получить контрастный текст (черный или белый) для цвета
 * @param {string} hex - Цвет фона
 * @returns {string} #000000 или #FFFFFF
 */
export function getContrastTextColor(hex) {
  return isLightColor(hex) ? '#000000' : '#FFFFFF';
}

/**
 * Увеличить/уменьшить яркость цвета
 * @param {string} hex - Цвет в формате #RRGGBB
 * @param {number} percent - Процент изменения яркости (-100 до 100)
 * @returns {string} Изменённый цвет
 */
export function adjustBrightness(hex, percent) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  let newL = hsl.l + (hsl.l * percent / 100);
  newL = Math.max(0, Math.min(100, newL));

  return hslToHex(hsl.h, hsl.s, newL);
}

/**
 * Генерировать оттенки цвета (от светлого к тёмному)
 * @param {string} baseHex - Базовый цвет
 * @param {number} count - Количество оттенков
 * @returns {array} Массив HEX цветов
 */
export function generateTints(baseHex, count = 5) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return [];

  const tints = [];
  for (let i = 0; i < count; i++) {
    const lightness = (100 / count) * (i + 1);
    tints.push(hslToHex(hsl.h, hsl.s, lightness));
  }
  return tints;
}

/**
 * Генерировать тени цвета (от светлого к чёрному)
 * @param {string} baseHex - Базовый цвет
 * @param {number} count - Количество теней
 * @returns {array} Массив HEX цветов
 */
export function generateShades(baseHex, count = 5) {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return [];

  const shades = [];
  for (let i = 0; i < count; i++) {
    const lightness = 50 - (50 / count) * (i + 1);
    shades.push(hslToHex(hsl.h, hsl.s, lightness));
  }
  return shades;
}