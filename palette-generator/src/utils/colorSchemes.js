

import { hslToHex, hexToHsl, generateRandomColor } from './colorUtils.js';

/**
 * Сгенерировать случайную палитру
 * @param {number} count - Количество цветов (по умолчанию 5)
 * @param {array} locked - Индексы закреплённых цветов
 * @returns {array} Массив HEX цветов
 */
export function generateRandomPalette(count = 5, locked = []) {
  const palette = [];
  
  for (let i = 0; i < count; i++) {
    if (locked.includes(i)) {
      // Закреплённый цвет остаётся прежним (будет передан снаружи)
      palette.push(null);
    } else {
      palette.push(generateRandomColor());
    }
  }
  
  return palette;
}

/**
 * Сгенерировать монохромную палитру (оттенки одного цвета)
 * @param {string} baseColor - Базовый цвет (#RRGGBB)
 * @param {number} count - Количество цветов
 * @returns {array} Массив HEX цветов
 */
export function generateMonochromatic(baseColor, count = 5) {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return [];

  const palette = [];
  const step = 100 / (count + 1);

  for (let i = 1; i <= count; i++) {
    const lightness = step * i;
    palette.push(hslToHex(hsl.h, hsl.s, lightness));
  }

  return palette;
}

/**
 * Сгенерировать аналогичную палитру (соседние цвета на круге)
 * @param {string} baseColor - Базовый цвет
 * @param {number} count - Количество цветов (нечётное число для симметрии)
 * @returns {array} Массив HEX цветов
 */
export function generateAnalogous(baseColor, count = 5) {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return [];

  const palette = [];
  const step = 30; // 30 градусов между соседними цветами
  const offset = Math.floor(count / 2);

  for (let i = -offset; i <= offset; i++) {
    let hue = (hsl.h + step * i) % 360;
    if (hue < 0) hue += 360;
    palette.push(hslToHex(hue, hsl.s, hsl.l));
  }

  return palette;
}

/**
 * Сгенерировать комплементарную палитру (противоположные цвета)
 * @param {string} baseColor - Базовый цвет
 * @param {number} count - Количество цветов
 * @returns {array} Массив HEX цветов
 */
export function generateComplementary(baseColor, count = 5) {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return [];

  const palette = [];
  
  // Базовый цвет и его варианты
  for (let i = 0; i < Math.ceil(count / 2); i++) {
    const lightness = 30 + i * (40 / Math.ceil(count / 2));
    palette.push(hslToHex(hsl.h, hsl.s, lightness));
  }

  // Комплементарный цвет (противоположный на круге) и его варианты
  const complementaryHue = (hsl.h + 180) % 360;
  for (let i = 0; i < Math.floor(count / 2); i++) {
    const lightness = 30 + i * (40 / Math.floor(count / 2));
    palette.push(hslToHex(complementaryHue, hsl.s, lightness));
  }

  return palette.slice(0, count);
}

/**
 * Сгенерировать триаду (3 равномерно распределённых цвета)
 * @param {string} baseColor - Базовый цвет
 * @param {number} count - Количество цветов (будет расширено для каждого из 3 основных)
 * @returns {array} Массив HEX цветов
 */
export function generateTriadic(baseColor, count = 5) {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return [];

  const palette = [];
  const mainHues = [
    hsl.h,
    (hsl.h + 120) % 360,
    (hsl.h + 240) % 360
  ];

  const perColor = Math.ceil(count / 3);

  mainHues.forEach(hue => {
    for (let i = 0; i < perColor; i++) {
      const lightness = 40 + i * (40 / perColor);
      palette.push(hslToHex(hue, hsl.s, lightness));
    }
  });

  return palette.slice(0, count);
}

/**
 * Сгенерировать тетраду (4 цвета в прямоугольнике)
 * @param {string} baseColor - Базовый цвет
 * @param {number} count - Количество цветов
 * @returns {array} Массив HEX цветов
 */
export function generateTetradic(baseColor, count = 5) {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return [];

  const palette = [];
  const mainHues = [
    hsl.h,
    (hsl.h + 90) % 360,
    (hsl.h + 180) % 360,
    (hsl.h + 270) % 360
  ];

  const perColor = Math.ceil(count / 4);

  mainHues.forEach(hue => {
    for (let i = 0; i < perColor; i++) {
      const lightness = 40 + i * (40 / perColor);
      palette.push(hslToHex(hue, hsl.s, lightness));
    }
  });

  return palette.slice(0, count);
}

/**
 * Генерировать палитру по "настроению"
 * @param {string} mood - Настроение: 'calm', 'energetic', 'professional'
 * @param {number} count - Количество цветов
 * @returns {array} Массив HEX цветов
 */
export function generateByMood(mood = 'calm', count = 5) {
  let baseColor;

  switch (mood) {
    case 'calm':
      // Спокойные цвета: синий, зелёный, голубой
      baseColor = '#4A90E2'; // Спокойный синий
      return generateAnalogous(baseColor, count);

    case 'energetic':
      // Энергичные цвета: красный, оранжевый, жёлтый
      baseColor = '#FF6B6B'; // Энергичный красный
      return generateAnalogous(baseColor, count);

    case 'professional':
      // Профессиональные цвета: чёрный, серый, синий
      baseColor = '#2C3E50'; // Тёмно-синий (профессиональный)
      return generateMonochromatic(baseColor, count);

    default:
      return generateRandomPalette(count);
  }
}

/**
 * Вся информация о схеме
 */
export const paletteSchemes = {
  random: {
    name: 'Случайная',
    description: 'Полностью случайные цвета',
    generate: generateRandomPalette
  },
  monochromatic: {
    name: 'Монохромная',
    description: 'Оттенки одного цвета',
    generate: generateMonochromatic
  },
  analogous: {
    name: 'Аналогичная',
    description: 'Соседние цвета на круге',
    generate: generateAnalogous
  },
  complementary: {
    name: 'Комплементарная',
    description: 'Противоположные цвета',
    generate: generateComplementary
  },
  triadic: {
    name: 'Триада',
    description: '3 равномерно распределённых цвета',
    generate: generateTriadic
  },
  tetradic: {
    name: 'Тетрада',
    description: '4 цвета в прямоугольнике',
    generate: generateTetradic
  },
  calm: {
    name: 'Спокойная',
    description: 'Мягкие, расслабляющие цвета',
    generate: (baseColor, count) => generateByMood('calm', count)
  },
  energetic: {
    name: 'Энергичная',
    description: 'Яркие, динамичные цвета',
    generate: (baseColor, count) => generateByMood('energetic', count)
  },
  professional: {
    name: 'Профессиональная',
    description: 'Консервативные, деловые цвета',
    generate: (baseColor, count) => generateByMood('professional', count)
  }
};