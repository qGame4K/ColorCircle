<template>
  <div class="library">
    <div class="library-header">
      <h3>Библиотека палитр ({{ palettes.length }})</h3>
      
      <!-- Сохранение текущей палитры -->
      <div class="save-form">
        <input 
          v-model="saveName" 
          placeholder="Название палитры..." 
          @keyup.enter="saveCurrentPalette"
        />
        <input 
          v-model="saveTags" 
          placeholder="теги,через,запятую"
        />
        <button @click="saveCurrentPalette" class="btn-save">
          Сохранить
        </button>
      </div>
    </div>

    <!-- Поиск -->
    <div class="search-section">
      <input 
        v-model="searchQuery"
        placeholder="🔍 Поиск по названию и тегам..."
        class="search-input"
      />
    </div>

    <!-- Список палитр -->
    <div v-if="filteredPalettes.length" class="palettes-grid">
      <div 
        v-for="palette in filteredPalettes" 
        :key="palette.id"
        class="palette-item"
        @click="selectPalette(palette)"
      >
        <div class="palette-colors">
          <div 
            v-for="(color, i) in palette.colors.slice(0, 5)"
            :key="i"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            :title="color"
          />
          <span v-if="palette.colors.length > 5" class="more">+{{ palette.colors.length - 5 }}</span>
        </div>
        
        <div class="palette-info">
          <h4>{{ palette.name }}</h4>
          <div class="meta">
            <span class="scheme">{{ palette.scheme }}</span>
            <span class="date">{{ formatDate(palette.createdAt) }}</span>
          </div>
          <div v-if="palette.tags.length" class="tags">
            <span v-for="tag in palette.tags.slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
            <span v-if="palette.tags.length > 3" class="more-tags">+{{ palette.tags.length - 3 }}</span>
          </div>
        </div>
        
        <div class="actions">
          <button @click.stop="selectPalette(palette)" class="btn-select">Выбрать</button>
          <button @click.stop="handleDeletePalette(palette.id)" class="btn-delete">🗑️</button>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <p>Палитр пока нет</p>
      <p>Сохраните первую палитру кнопкой выше!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getAllPalettes, 
  savePalette, 
  deletePalette as deletePaletteStorage, 
  searchPalettes 
} from '../utils/paletteStorage.js'

const emit = defineEmits(['select-palette'])

const saveName = ref('')
const saveTags = ref('')
const searchQuery = ref('')
const palettes = ref([])

const filteredPalettes = computed(() => {
  if (!searchQuery.value.trim()) return palettes.value
  return searchPalettes(searchQuery.value)
})

const saveCurrentPalette = () => {
  if (!saveName.value.trim()) {
    alert('Введите название палитры')
    return
  }

  const tags = saveTags.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t)

  // TODO: сюда можно прокинуть текущую палитру через пропсы
  const currentColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FECA57', '#48BB78']
  
  savePalette(currentColors, saveName.value, 'custom', tags)
  
  saveName.value = ''
  saveTags.value = ''
  loadPalettes()
}

const handleDeletePalette = (id) => {
  if (confirm('Удалить палитру?')) {
    deletePaletteStorage(id)
    loadPalettes()
  }
}

const selectPalette = (palette) => {
  emit('select-palette', palette)
}

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const loadPalettes = () => {
  palettes.value = getAllPalettes()
}

onMounted(loadPalettes)
</script>

<style scoped>
.library { padding: 2rem; background: white; border-radius: 0.5rem; }
.library-header { 
  display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; 
}
.save-form { 
  display: grid; grid-template-columns: 2fr 1fr auto; gap: 1rem; 
}
.save-form input { 
  padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; 
}
.btn-save { 
  padding: 0.75rem 1rem; background: #48bb78; color: white; border: none; 
  border-radius: 0.375rem; font-weight: 600; cursor: pointer; 
}
.btn-save:hover { background: #38a169; }

.search-section { margin-bottom: 2rem; }
.search-input { 
  width: 100%; padding: 0.75rem 1rem; border: 2px solid #e2e8f0; 
  border-radius: 0.5rem; font-size: 1rem; 
}
.search-input:focus { outline: none; border-color: #667eea; }

.palettes-grid { 
  display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
  gap: 1.5rem; 
}

.palette-item { 
  display: grid; grid-template-columns: 80px 1fr auto; gap: 1rem; 
  padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; 
  cursor: pointer; transition: all 0.2s; 
}
.palette-item:hover { 
  border-color: #667eea; box-shadow: 0 8px 25px rgba(102,126,234,0.15); 
  transform: translateY(-2px); 
}

.palette-colors { display: flex; gap: 0.25rem; align-items: center; }
.color-swatch { 
  width: 24px; height: 24px; border-radius: 0.25rem; border: 1px solid #fff; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
}
.more { 
  font-size: 0.75rem; color: #a0aec0; font-weight: 600; margin-left: 0.5rem; 
}

.palette-info h4 { margin: 0 0 0.5rem 0; color: #2d3748; }
.meta { display: flex; gap: 1rem; margin-bottom: 0.75rem; font-size: 0.875rem; color: #718096; }
.scheme { 
  background: #ebf8ff; color: #2c5282; padding: 0.125rem 0.5rem; 
  border-radius: 9999px; font-size: 0.75rem; font-weight: 600; 
}
.tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag { 
  background: #edf2f7; color: #4a5568; padding: 0.125rem 0.5rem; 
  border-radius: 9999px; font-size: 0.75rem; 
}
.more-tags { color: #a0aec0; font-size: 0.75rem; }

.actions { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; }
.btn-select, .btn-delete { 
  padding: 0.375rem 0.75rem; border: none; border-radius: 0.25rem; 
  font-size: 0.875rem; cursor: pointer; font-weight: 600; width: 100%; 
}
.btn-select { background: #667eea; color: white; }
.btn-select:hover { background: #5a67d8; }
.btn-delete { 
  background: #fed7d7; color: #c53030; 
}
.btn-delete:hover { background: #fc8181; }

.empty { 
  text-align: center; padding: 4rem 2rem; color: #a0aec0; 
}
.empty p { margin-bottom: 0.5rem; }
</style>
