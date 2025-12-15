// ============================================
// src/utils/contrastChecker.js
// ============================================
// Проверка контрастности по стандарту WCAG

import { hexToRgb } from './colorUtils.js';

/**
 * Вычислить относительную яркость по WCAG
 * @param {string} hex - Цвет в формате #RRGGBB
 * @returns {number} Яркость от 0 до 1
 */
export function getRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Применить гамма-коррекцию
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Вычислить коэффициент контрастности между двумя цветами
 * @param {string} foregroundHex - Цвет переднего плана
 * @param {string} backgroundHex - Цвет фона
 * @returns {number} Коэффициент контрастности (1-21)
 */
export function getContrastRatio(foregroundHex, backgroundHex) {
  const l1 = getRelativeLuminance(foregroundHex);
  const l2 = getRelativeLuminance(backgroundHex);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Определить уровень доступности (AA, AAA или недостаточно)
 * @param {number} ratio - Коэффициент контрастности
 * @param {boolean} largeText - Большой ли текст (14pt+)
 * @returns {object} {level: 'AAA' | 'AA' | 'Fail', status: 'Отлично' | 'Хорошо' | 'Плохо'}
 */
export function getAccessibilityLevel(ratio, largeText = false) {
  if (largeText) {
    // Для больших текстов требования ниже
    if (ratio >= 4.5) return { level: 'AAA', status: 'Отлично' };
    if (ratio >= 3.0) return { level: 'AA', status: 'Хорошо' };
  } else {
    // Для обычного текста требования выше
    if (ratio >= 7) return { level: 'AAA', status: 'Отлично' };
    if (ratio >= 4.5) return { level: 'AA', status: 'Хорошо' };
  }

  return { level: 'Fail', status: 'Плохо' };
}

/**
 * Проверить доступность для пары цветов
 * @param {string} foregroundHex - Цвет текста
 * @param {string} backgroundHex - Цвет фона
 * @returns {object} Полная информация о контрасте и доступности
 */
export function checkContrast(foregroundHex, backgroundHex) {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  const ratioForLarge = getAccessibilityLevel(ratio, true);
  const ratioForNormal = getAccessibilityLevel(ratio, false);

  return {
    ratio: ratio.toFixed(2),
    normalText: ratioForNormal,
    largeText: ratioForLarge,
    isAccessible: ratio >= 4.5
  };
}

/**
 * Найти лучший текстовый цвет (чёрный или белый) для фона
 * @param {string} backgroundHex - Цвет фона
 * @returns {object} {color: '#000000' | '#FFFFFF', contrast: number}
 */
export function getBestTextColor(backgroundHex) {
  const blackContrast = getContrastRatio('#000000', backgroundHex);
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundHex);

  if (whiteContrast > blackContrast) {
    return {
      color: '#FFFFFF',
      contrast: whiteContrast.toFixed(2),
      accessibility: getAccessibilityLevel(whiteContrast, false)
    };
  } else {
    return {
      color: '#000000',
      contrast: blackContrast.toFixed(2),
      accessibility: getAccessibilityLevel(blackContrast, false)
    };
  }
}

/**
 * Проверить доступность всех цветов в палитре (каждый как фон с белым/чёрным текстом)
 * @param {array} paletteHexes - Массив цветов в формате #RRGGBB
 * @returns {array} Массив объектов с информацией о доступности
 */
export function checkPaletteAccessibility(paletteHexes) {
  return paletteHexes.map(hex => ({
    color: hex,
    textColor: getBestTextColor(hex),
    whiteTextContrast: getContrastRatio('#FFFFFF', hex).toFixed(2),
    blackTextContrast: getContrastRatio('#000000', hex).toFixed(2)
  }));
}

/**
 * Найти акцентный цвет (с наибольшим контрастом относительно основного)
 * @param {string} baseColor - Базовый цвет
 * @param {array} candidates - Кандидаты на акцентный цвет
 * @returns {string} HEX лучшего акцентного цвета
 */
export function findBestAccentColor(baseColor, candidates) {
  if (candidates.length === 0) return baseColor;

  let bestColor = candidates[0];
  let maxContrast = getContrastRatio(candidates[0], baseColor);

  for (let i = 1; i < candidates.length; i++) {
    const contrast = getContrastRatio(candidates[i], baseColor);
    if (contrast > maxContrast) {
      maxContrast = contrast;
      bestColor = candidates[i];
    }
  }

  return bestColor;
}

/**
 * Получить рекомендации по улучшению контрастности
 * @param {string} foregroundHex - Цвет переднего плана
 * @param {string} backgroundHex - Цвет фона
 * @returns {array} Массив рекомендаций
 */
export function getContrastRecommendations(foregroundHex, backgroundHex) {
  const contrast = getContrastRatio(foregroundHex, backgroundHex);
  const recommendations = [];

  if (contrast < 3) {
    recommendations.push('⚠️ Контрастность очень низкая. Нужно значительное изменение.');
    recommendations.push('💡 Попробуйте выбрать более светлый или более тёмный цвет.');
  } else if (contrast < 4.5) {
    recommendations.push('⚠️ Контрастность достаточна только для больших текстов (14pt+).');
    recommendations.push('💡 Для обычного текста нужно увеличить различие яркости.');
  } else if (contrast < 7) {
    recommendations.push('✅ Соответствует стандарту WCAG AA для всех текстов.');
    recommendations.push('💡 Для максимальной доступности (AAA) увеличьте контраст ещё больше.');
  } else {
    recommendations.push('✅ Отлично! Соответствует стандарту WCAG AAA.');
    recommendations.push('💡 Эта комбинация доступна для всех пользователей.');
  }

  return recommendations;
}