<template>
  <div class="app" :data-theme="isDarkMode ? 'dark' : 'light'">
    <!-- Шапка приложения -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">Генератор Цветовой Палитры(осуждаем)</h1>
        <div class="header-controls">
          <button 
            class="btn-icon" 
            @click="isDarkMode = !isDarkMode"
            :title="isDarkMode ? 'Светлая тема' : 'Тёмная тема'"
          >
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
          <button 
            class="btn-icon"
            @click="showAbout = !showAbout"
            title="О приложении"
          >
            ℹ
          </button>
        </div>
      </div>
    </header>

    <!-- Основной контент -->
    <main class="app-main">
      <!-- Практика 27: Основной генератор -->
      <section class="section-main">
        <PaletteGenerator 
          v-if="!showAdvanced"
          @palette-generated="onPaletteGenerated"
        />
        
        <!-- Практика 28: Продвинутые функции -->
        <div v-else class="advanced-section">
          <div class="tabs">
            <button 
              v-for="tab in advancedTabs"
              :key="tab"
              class="tab-button"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>

          <div class="tab-content">
            <AccessibilityChecker 
              v-if="activeTab === 'Доступность'"
              :colors="currentPalette"
            />
            <PaletteLibrary 
              v-if="activeTab === 'Библиотека'"
              @palette-selected="onPaletteSelected"
            />
            <ExportOptions 
              v-if="activeTab === 'Экспорт'"
              :colors="currentPalette"
            />
            <ColorWheelVisual 
              v-if="activeTab === 'Круг цветов'"
              :baseColor="currentPalette[0] || '#FF0000'"
            />
          </div>
        </div>
      </section>

      <!-- Переключатель между Практикой 27 и 28 -->
      <div class="practice-toggle">
        <button 
          class="btn-toggle"
          :class="{ active: !showAdvanced }"
          @click="showAdvanced = false"
        >
          (Базовый)
        </button>
        <button 
          class="btn-toggle"
          :class="{ active: showAdvanced }"
          @click="showAdvanced = true"
        >
          (Продвинутый)
        </button>
      </div>

      <!-- Модальное окно "О приложении" -->
      <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
        <div class="modal" @click.stop>
          <h2>О Генераторе Цветовых Палитр</h2>
          <p>Полнофункциональное веб-приложение на Vue 3 для создания и управления цветовыми палитрами.</p>
          
          <h3>Практика 27: Базовый функционал</h3>
          <ul>
            <li>✅ Генерация случайных палитр</li>
            <li>✅ Выбор количества цветов (3, 5, 7)</li>
            <li>✅ Форматы HEX и RGB</li>
            <li>✅ Копирование в буфер обмена</li>
            <li>✅ Закрепление цветов</li>
            <li>✅ Локальное сохранение</li>
            <li>✅ Превью в UI элементах</li>
            <li>✅ Светлая/Тёмная тема</li>
          </ul>

          <h3>Практика 28: Продвинутые функции</h3>
          <ul>
            <li>✅ Генерация по базовому цвету</li>
            <li>✅ Схемы: монохромная, аналогичная, триада, комплементарная</li>
            <li>✅ Проверка контраста WCAG</li>
            <li>✅ Управление коллекциями палитр</li>
            <li>✅ Поиск и фильтрация</li>
            <li>✅ Экспорт CSS/SCSS/Tailwind</li>
            <li>✅ Визуализация цветового круга</li>
          </ul>

          <button class="btn btn-primary" @click="showAbout = false">
            Закрыть
          </button>
        </div>
      </div>
    </main>

    <!-- Нотификации -->
    <transition-group name="notification" class="notifications">
      <div 
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
      >
        {{ notification.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import PaletteGenerator from './components/PaletteGenerator.vue';
import AccessibilityChecker from './components/AccessibilityChecker.vue';
import PaletteLibrary from './components/PaletteLibrary.vue';
import ExportOptions from './components/ExportOptions.vue';
import ColorWheelVisual from './components/ColorWheelVisual.vue';

// Состояние приложения
const isDarkMode = ref(false);
const showAbout = ref(false);
const showAdvanced = ref(false);
const activeTab = ref('Доступность');
const currentPalette = ref(['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']);
const advancedTabs = ['Доступность', 'Библиотека', 'Экспорт', 'Круг цветов'];
const notifications = ref([]);

// Обработчики событий
const onPaletteGenerated = (palette) => {
  currentPalette.value = palette;
};

const onPaletteSelected = (palette) => {
  currentPalette.value = palette.colors;
};

// Система уведомлений
const showNotification = (message, type = 'success') => {
  const id = Date.now();
  notifications.value.push({ id, message, type });

  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== id);
  }, 3000);
};

// Загрузка темы из localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
  } else {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
});

// Сохранение темы при изменении
watch(isDarkMode, (newValue) => {
  localStorage.setItem('theme', newValue ? 'dark' : 'light');
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --border-color: #dddddd;
  --accent-color: #3498db;
  --accent-hover: #2980b9;
}

.app[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #aaaaaa;
  --border-color: #444444;
  --accent-color: #3498db;
  --accent-hover: #5dade2;
}

/* Шапка */
.app-header {
  background: linear-gradient(135deg, var(--accent-color) 0%, #2980b9 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Основной контент */
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-main {
  margin-bottom: 40px;
}

/* Переключатель практик */
.practice-toggle {
  display: flex;
  gap: 15px;
  margin-top: 40px;
  justify-content: center;
  padding-top: 40px;
  border-top: 2px solid var(--border-color);
}

.btn-toggle {
  padding: 12px 24px;
  border: 2px solid var(--accent-color);
  background: transparent;
  color: var(--accent-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-toggle.active {
  background: var(--accent-color);
  color: white;
}

.btn-toggle:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  color: white;
}

/* Вкладки для Практики 28 */
.advanced-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 30px;
  border: 1px solid var(--border-color);
}

.tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--border-color);
  flex-wrap: wrap;
}

.tab-button {
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 600;
  transition: all 0.3s;
}

.tab-button.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tab-button:hover {
  color: var(--accent-color);
}

.tab-content {
  min-height: 400px;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal h2 {
  margin-bottom: 20px;
  color: var(--accent-color);
}

.modal h3 {
  margin-top: 25px;
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--text-primary);
}

.modal ul {
  list-style: none;
  margin-bottom: 20px;
}

.modal li {
  padding: 8px 0;
  color: var(--text-secondary);
}

.modal li:before {
  content: "✓ ";
  color: #27ae60;
  font-weight: bold;
  margin-right: 8px;
}

/* Кнопки */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

/* Уведомления */
.notifications {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2000;
}

.notification {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  border-left: 4px solid #27ae60;
  color: #27ae60;
}

.notification.error {
  border-left: 4px solid #e74c3c;
  color: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .app-title {
    font-size: 22px;
  }

  .practice-toggle {
    flex-direction: column;
  }

  .modal {
    padding: 30px 20px;
  }

  .tabs {
    flex-direction: column;
  }
}
</style>
