<template>
  <div class="checker">
    <h3>🔍 WCAG Проверка</h3>
    <div class="inputs">
      <div class="input-group">
        <label>Текст:</label>
        <input v-model="fgColor" type="color">
        <input v-model="fgColor" type="text" placeholder="#FFFFFF">
      </div>
      <div class="input-group">
        <label>Фон:</label>
        <input v-model="bgColor" type="color">
        <input v-model="bgColor" type="text" placeholder="#000000">
      </div>
    </div>
    <div class="preview" :style="{ backgroundColor: bgColor, color: fgColor }">
      AaBbCcDdEeFfGg
      <br><small>14pt / 18pt</small>
    </div>
    <div class="result">
      <p>Контраст: <strong>{{ ratio }}:1</strong></p>
      <p>Обычный текст: <span :class="levelClass('normal')">{{ levelNormal }}</span></p>
      <p>Большой текст: <span :class="levelClass('large')">{{ levelLarge }}</span></p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getContrastRatio, getAccessibilityLevel } from '../utils/contrastChecker.js'

const fgColor = ref('#000000')
const bgColor = ref('#FFFFFF')

const ratio = ref(21)
const levelNormal = ref('AAA')
const levelLarge = ref('AAA')

watch([fgColor, bgColor], () => {
  const r = getContrastRatio(fgColor.value, bgColor.value)
  ratio.value = r.toFixed(2)
  
  const normal = getAccessibilityLevel(r, false)
  const large = getAccessibilityLevel(r, true)
  
  levelNormal.value = normal.status + ' (' + normal.level + ')'
  levelLarge.value = large.status + ' (' + large.level + ')'
}, { immediate: true })

const levelClass = (size) => {
  const level = size === 'normal' ? levelNormal.value : levelLarge.value
  if (level.includes('AAA')) return 'aaa'
  if (level.includes('AA')) return 'aa'
  return 'fail'
}
</script>

<style scoped>
.checker { padding: 2rem; background: white; border-radius: 0.5rem; }
.inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
.input-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-group input[type="color"] { width: 100%; height: 3rem; border-radius: 0.375rem; border: 1px solid #e2e8f0; }
.input-group input[type="text"] { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; }
.preview { 
  padding: 2rem; text-align: center; font-size: 1.25rem; font-weight: 600; 
  min-height: 120px; display: flex; flex-direction: column; justify-content: center; 
  border-radius: 0.5rem; margin-bottom: 1.5rem; 
}
small { font-size: 0.875rem; font-weight: normal; opacity: 0.8; }
.result p { margin: 0.5rem 0; }
.result span.aaa { color: #38a169; font-weight: 600; }
.result span.aa { color: #ed8936; font-weight: 600; }
.result span.fail { color: #e53e3e; font-weight: 600; }
</style>
