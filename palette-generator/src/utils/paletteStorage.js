// ============================================
// src/utils/paletteStorage.js
// ============================================
// Управление сохранением палитр в localStorage

const STORAGE_KEY = 'colorPalettes';
const CURRENT_PALETTE_KEY = 'currentPalette';

/**
 * Получить все сохранённые палитры
 * @returns {array} Массив палитр с метаданными
 */
export function getAllPalettes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Ошибка чтения палитр:', error);
    return [];
  }
}

/**
 * Получить одну палитру по ID
 * @param {string} id - ID палитры
 * @returns {object|null} Объект палитры или null
 */
export function getPaletteById(id) {
  const palettes = getAllPalettes();
  return palettes.find(p => p.id === id) || null;
}

/**
 * Сохранить текущую палитру
 * @param {array} colors - Массив цветов в формате HEX
 * @param {string} name - Название палитры
 * @param {string} scheme - Тип схемы (random, monochromatic и т.д.)
 * @param {array} tags - Теги для поиска
 * @returns {object} Сохранённая палитра с ID
 */
export function savePalette(colors, name = 'Палитра', scheme = 'random', tags = []) {
  const palettes = getAllPalettes();

  const newPalette = {
    id: Date.now().toString(),
    name,
    scheme,
    colors,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  palettes.push(newPalette);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    return newPalette;
  } catch (error) {
    console.error('Ошибка сохранения палитры:', error);
    return null;
  }
}

/**
 * Обновить существующую палитру
 * @param {string} id - ID палитры
 * @param {object} updates - Объект с полями для обновления
 * @returns {object|null} Обновленная палитра или null
 */
export function updatePalette(id, updates) {
  const palettes = getAllPalettes();
  const index = palettes.findIndex(p => p.id === id);

  if (index === -1) {
    console.error('Палитра не найдена');
    return null;
  }

  palettes[index] = {
    ...palettes[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    return palettes[index];
  } catch (error) {
    console.error('Ошибка обновления палитры:', error);
    return null;
  }
}

/**
 * Удалить палитру по ID
 * @param {string} id - ID палитры
 * @returns {boolean} true если удалена, false если не найдена
 */
export function deletePalette(id) {
  const palettes = getAllPalettes();
  const index = palettes.findIndex(p => p.id === id);

  if (index === -1) {
    console.error('Палитра не найдена');
    return false;
  }

  palettes.splice(index, 1);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    return true;
  } catch (error) {
    console.error('Ошибка удаления палитры:', error);
    return false;
  }
}

/**
 * Поиск палитр по названию или тегам
 * @param {string} query - Поисковый запрос
 * @returns {array} Найденные палитры
 */
export function searchPalettes(query) {
  const palettes = getAllPalettes();
  const lowerQuery = query.toLowerCase();

  return palettes.filter(palette => {
    const nameMatch = palette.name.toLowerCase().includes(lowerQuery);
    const tagsMatch = palette.tags.some(tag => 
      tag.toLowerCase().includes(lowerQuery)
    );
    return nameMatch || tagsMatch;
  });
}

/**
 * Фильтровать палитры по тегам
 * @param {array} tags - Массив тегов для фильтрации
 * @returns {array} Отфильтрованные палитры
 */
export function filterPalettesByTags(tags) {
  const palettes = getAllPalettes();

  if (tags.length === 0) {
    return palettes;
  }

  return palettes.filter(palette => {
    return tags.every(tag => palette.tags.includes(tag));
  });
}

/**
 * Получить все уникальные теги
 * @returns {array} Массив тегов
 */
export function getAllTags() {
  const palettes = getAllPalettes();
  const tagsSet = new Set();

  palettes.forEach(palette => {
    palette.tags.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * Сохранить текущую палитру в сессию (без добавления в коллекцию)
 * @param {object} palette - Объект с colors, format и т.д.
 */
export function setCurrentPalette(palette) {
  try {
    localStorage.setItem(CURRENT_PALETTE_KEY, JSON.stringify(palette));
  } catch (error) {
    console.error('Ошибка сохранения текущей палитры:', error);
  }
}

/**
 * Получить текущую палитру из сессии
 * @returns {object|null} Объект палитры или null
 */
export function getCurrentPalette() {
  try {
    const data = localStorage.getItem(CURRENT_PALETTE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Ошибка чтения текущей палитры:', error);
    return null;
  }
}

/**
 * Очистить все палитры
 * @returns {boolean} true если успешно очищено
 */
export function clearAllPalettes() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Ошибка очистки палитр:', error);
    return false;
  }
}

/**
 * Экспортировать палитры в JSON
 * @returns {string} JSON строка со всеми палитрами
 */
export function exportPalettesAsJson() {
  const palettes = getAllPalettes();
  return JSON.stringify(palettes, null, 2);
}

/**
 * Импортировать палитры из JSON
 * @param {string} jsonString - JSON строка с палитрами
 * @returns {boolean} true если успешно импортировано
 */
export function importPalettesFromJson(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    
    if (!Array.isArray(imported)) {
      throw new Error('Неверный формат JSON');
    }

    // Добавляем новые ID для импортированных палитр
    const palettes = imported.map(p => ({
      ...p,
      id: Date.now().toString() + Math.random()
    }));

    const existing = getAllPalettes();
    const merged = [...existing, ...palettes];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return true;
  } catch (error) {
    console.error('Ошибка импорта палитр:', error);
    return false;
  }
}