<template>
  <div class="palette-generator">
    <h2>Генератор Палитр</h2>

    <!-- Элементы управления -->
    <div class="controls">
      <!-- Кнопка генерации -->
      <button 
        class="btn btn-generate"
        @click="generatePalette"
        :disabled="isGenerating"
      >
        {{ isGenerating ? 'Генерирую...' : 'Рандомная палитра' }}
      </button>

      <!-- Выбор количества цветов -->
      <div class="control-group">
        <label for="color-count">Количество цветов:</label>
        <select id="color-count" v-model.number="colorCount" @change="generatePalette">
          <option value="3">3 цвета</option>
          <option value="5">5 цветов</option>
          <option value="7">7 цветов</option>
        </select>
      </div>

      <!-- Выбор формата -->
      <div class="control-group">
        <label for="color-format">Формат:</label>
        <select id="color-format" v-model="colorFormat">
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
      </div>

      <!-- Кнопка сохранения -->
      <button 
        class="btn btn-save"
        @click="savePalette"
      >
        Сохранить
      </button>
    </div>

    <!-- Палитра -->
    <div class="palette-section">
      <div class="palette-display">
        <div
          v-for="(color, index) in palette"
          :key="index"
          class="color-card"
        >
          <div 
            class="color-box"
            :style="{ backgroundColor: color }"
            @click="copyToClipboard(color, index)"
            :title="`Кликни для копирования`"
          >
            <span v-if="lockedColors.includes(index)" class="lock-icon">🔒</span>
          </div>
          <div class="color-info">
            <p class="color-value">{{ formatColor(color) }}</p>
            <button 
              class="btn-lock"
              @click="toggleLock(index)"
              :class="{ locked: lockedColors.includes(index) }"
              :title="lockedColors.includes(index) ? 'Разблокировать' : 'Заблокировать'"
            >
              {{ lockedColors.includes(index) ? '🔒' : '🔓' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Превью в UI элементах -->
    <div class="preview-section">
      <h3>Превью в интерфейсе</h3>
      
      <div class="preview-grid">
        <!-- Кнопки -->
        <div class="preview-item">
          <h4>Кнопки</h4>
          <div class="button-preview">
            <button 
              v-for="(color, index) in palette.slice(0, 3)"
              :key="`btn-${index}`"
              class="preview-button"
              :style="{ backgroundColor: color, color: getTextColor(color) }"
            >
              Кнопка
            </button>
          </div>
        </div>

        <!-- Карточки -->
        <div class="preview-item">
          <h4>Карточки</h4>
          <div class="card-preview">
            <div
              v-for="(color, index) in palette.slice(0, 3)"
              :key="`card-${index}`"
              class="preview-card"
              :style="{ borderTop: `4px solid ${color}` }"
            >
              <p>Карточка</p>
            </div>
          </div>
        </div>

        <!-- Заголовки -->
        <div class="preview-item">
          <h4>Заголовки</h4>
          <div class="heading-preview">
            <h5 v-for="(color, index) in palette.slice(0, 3)" :key="`h-${index}`" :style="{ color }">
              Заголовок {{ index + 1 }}
            </h5>
          </div>
        </div>

        <!-- Фоны -->
        <div class="preview-item">
          <h4>Фоны с текстом</h4>
          <div class="background-preview">
            <div
              v-for="(color, index) in palette.slice(0, 3)"
              :key="`bg-${index}`"
              class="preview-bg"
              :style="{ backgroundColor: color, color: getTextColor(color) }"
            >
              Текст на фоне
            </div>
          </div>
        </div>
      </div>

      <!-- Переключение фона -->
      <div class="theme-toggle">
        <button 
          class="toggle-btn"
          :class="{ active: darkPreview }"
          @click="darkPreview = !darkPreview"
        >
          {{ darkPreview ? '☀️ Светлый фон' : '🌙 Тёмный фон' }}
        </button>
      </div>
    </div>

    <!-- Информация о сохранении -->
    <div v-if="lastSaved" class="save-info">
      ✅ Палитра сохранена: {{ lastSaved }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  generateRandomColor,
  hexToRgb,
  hexToHsl,
  getContrastTextColor
} from '../utils/colorUtils.js';
import { generateRandomPalette } from '../utils/colorSchemes.js';
import { 
  getCurrentPalette,
  setCurrentPalette
} from '../utils/paletteStorage.js';

const emit = defineEmits(['palette-generated']);

// Состояние
const palette = ref([]);
const colorCount = ref(5);
const colorFormat = ref('hex');
const lockedColors = ref([]);
const darkPreview = ref(false);
const isGenerating = ref(false);
const lastSaved = ref(null);

// Вычисляемые свойства
const formattedPalette = computed(() => {
  return palette.value.map(color => formatColor(color));
});

// Методы
const generatePalette = async () => {
  isGenerating.value = true;

  // Имитация задержки генерации
  await new Promise(resolve => setTimeout(resolve, 300));

  // Сохранить заблокированные цвета
  const newPalette = generateRandomPalette(colorCount.value, lockedColors.value);

  // Заполнить палитру
  for (let i = 0; i < colorCount.value; i++) {
    if (lockedColors.value.includes(i) && palette.value[i]) {
      // Сохранить заблокированный цвет
      newPalette[i] = palette.value[i];
    } else if (!newPalette[i]) {
      // Сгенерировать новый цвет
      newPalette[i] = generateRandomColor();
    }
  }

  palette.value = newPalette;
  setCurrentPalette({
    colors: palette.value,
    format: colorFormat.value,
    scheme: 'random'
  });

  emit('palette-generated', palette.value);
  isGenerating.value = false;
};

const formatColor = (hex) => {
  switch (colorFormat.value) {
    case 'rgb': {
      const rgb = hexToRgb(hex);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
    case 'hsl': {
      const hsl = hexToHsl(hex);
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    default:
      return hex;
  }
};

const getTextColor = (bgColor) => {
  return getContrastTextColor(bgColor);
};

const copyToClipboard = async (color, index) => {
  const formattedValue = formatColor(color);
  
  try {
    await navigator.clipboard.writeText(formattedValue);
    
    // Визуальная обратная связь
    const elem = event.target.closest('.color-box');
    if (elem) {
      elem.classList.add('copied');
      setTimeout(() => elem.classList.remove('copied'), 300);
    }

    // Уведомление
    const notification = new CustomEvent('show-notification', {
      detail: { message: `Скопировано: ${formattedValue}`, type: 'success' }
    });
    window.dispatchEvent(notification);
  } catch (err) {
    console.error('Ошибка копирования:', err);
  }
};

const toggleLock = (index) => {
  const idx = lockedColors.value.indexOf(index);
  if (idx > -1) {
    lockedColors.value.splice(idx, 1);
  } else {
    lockedColors.value.push(index);
  }
};

const savePalette = () => {
  setCurrentPalette({
    colors: palette.value,
    format: colorFormat.value,
    scheme: 'random',
    savedAt: new Date().toLocaleTimeString('ru-RU')
  });

  const now = new Date().toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  lastSaved.value = now;

  setTimeout(() => {
    lastSaved.value = null;
  }, 5000);
};

// Инициализация
onMounted(() => {
  const saved = getCurrentPalette();
  if (saved && saved.colors) {
    palette.value = saved.colors;
  } else {
    generatePalette();
  }
});

// Следить за изменением количества цветов
watch(colorCount, () => {
  lockedColors.value = lockedColors.value.filter(i => i < colorCount.value);
});
</script>

<style scoped>
.palette-generator {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 30px;
  border: 1px solid var(--border-color);
}

.palette-generator h2 {
  margin-bottom: 25px;
  font-size: 24px;
  color: var(--text-primary);
}

/* Элементы управления */
.controls {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-weight: 600;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.control-group select {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.2s;
}

.control-group select:hover {
  border-color: var(--accent-color);
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-generate {
  background: linear-gradient(135deg, var(--accent-color), #2980b9);
  color: white;
  grid-column: 1;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-save {
  background: #27ae60;
  color: white;
  grid-column: 4;
}

.btn-save:hover {
  background: #229954;
}

/* Палитра */
.palette-section {
  margin-bottom: 30px;
}

.palette-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.color-card {
  text-align: center;
}

.color-box {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  user-select: none;
}

.color-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.color-box.copied {
  animation: colorPulse 0.3s ease;
}

@keyframes colorPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.95); }
}

.lock-icon {
  position: absolute;
  font-size: 16px;
}

.color-info {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.color-value {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--text-secondary);
  word-break: break-all;
}

.btn-lock {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.2s;
  padding: 4px;
}

.btn-lock:hover {
  transform: scale(1.2);
}

.btn-lock.locked {
  color: #e74c3c;
}

/* Превью */
.preview-section {
  background: var(--bg-primary);
  padding: 25px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.preview-section h3 {
  margin-bottom: 20px;
  font-size: 18px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.preview-item h4 {
  font-size: 13px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.button-preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
}

.preview-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.card-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-card {
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border-top: 4px solid;
}

.preview-card p {
  margin: 0;
  font-size: 14px;
}

.heading-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.heading-preview h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.background-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-bg {
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

/* Переключатель темы превью */
.theme-toggle {
  text-align: center;
}

.toggle-btn {
  padding: 10px 20px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--bg-secondary);
}

.toggle-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

/* Информация о сохранении */
.save-info {
  padding: 12px 16px;
  background: #d5f4e6;
  color: #27ae60;
  border-radius: 6px;
  border-left: 4px solid #27ae60;
  font-size: 14px;
  font-weight: 600;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .controls {
    grid-template-columns: 1fr;
  }

  .btn-generate,
  .btn-save {
    grid-column: auto;
  }

  .palette-display {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>