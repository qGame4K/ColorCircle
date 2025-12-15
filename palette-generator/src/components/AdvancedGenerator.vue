<template>
  <div class="advanced-generator">
    <h3>Продвинутая генерация</h3>
    
    <div class="generator-controls">
      <!-- Базовый цвет -->
      <div class="control-group">
        <label>Базовый цвет:</label>
        <input v-model="baseColor" type="color" />
        <input v-model="baseColor" type="text" placeholder="#FF6B6B" />
      </div>

      <!-- Схема -->
      <div class="control-group">
        <label>Схема:</label>
        <select v-model="selectedScheme">
          <option v-for="scheme in schemes" :key="scheme.key" :value="scheme.key">
            {{ scheme.name }}
          </option>
        </select>
      </div>

      <!-- Количество -->
      <div class="control-group">
        <label>Количество:</label>
        <select v-model.number="colorCount">
          <option>3</option>
          <option>5</option>
          <option>7</option>
        </select>
      </div>

      <!-- Настроение -->
      <div class="control-group">
        <label>Настроение:</label>
        <select v-model="mood">
          <option>random</option>
          <option>calm</option>
          <option>energetic</option>
          <option>professional</option>
        </select>
      </div>
    </div>

    <button @click="generateAdvanced" class="btn-generate-advanced">
      Сгенерировать {{ schemes.find(s => s.key === selectedScheme)?.name }}
    </button>

    <!-- Результат -->
    <div class="advanced-palette">
      <div 
        v-for="(color, index) in advancedPalette" 
        :key="index"
        class="advanced-color"
        @click="copyColor(color)"
      >
        <div class="color-display" :style="{ backgroundColor: color }"></div>
        <code>{{ color }}</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { paletteSchemes } from '../utils/colorSchemes.js'

const baseColor = ref('#FF6B6B')
const selectedScheme = ref('analogous')
const colorCount = ref(5)
const mood = ref('random')
const advancedPalette = ref([])

const schemes = computed(() => Object.entries(paletteSchemes).map(([key, scheme]) => ({
  key,
  name: scheme.name,
  description: scheme.description
})))

const generateAdvanced = () => {
  const scheme = paletteSchemes[selectedScheme.value]
  advancedPalette.value = scheme.generate(baseColor.value, colorCount.value)
}

const copyColor = async (color) => {
  await navigator.clipboard.writeText(color)
  // Feedback...
}

generateAdvanced()
</script>

<style scoped>
.advanced-generator { padding: 2rem; background: white; border-radius: 0.5rem; }
.generator-controls { 
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 1.5rem; margin-bottom: 2rem; 
}
.control-group input[type="color"] { 
  width: 100%; height: 3rem; border-radius: 0.375rem; border: 1px solid #e2e8f0; 
}
.control-group input[type="text"] { 
  width: 100%; padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; margin-top: 0.25rem; 
}

.btn-generate-advanced { 
  width: 100%; padding: 1rem 2rem; background: linear-gradient(135deg, #667eea, #764ba2); 
  color: white; border: none; border-radius: 0.5rem; font-size: 1.125rem; font-weight: 600; 
  cursor: pointer; margin-bottom: 2rem; 
}
.btn-generate-advanced:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102,126,234,0.4); }

.advanced-palette { 
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; 
}
.advanced-color { 
  text-align: center; cursor: pointer; padding: 1rem; border-radius: 0.5rem; 
  background: #f7fafc; transition: all 0.2s; 
}
.advanced-color:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
.color-display { 
  width: 100%; height: 100px; border-radius: 0.375rem; margin-bottom: 0.75rem; 
}
code { font-size: 0.75rem; word-break: break-all; display: block; }
</style>
