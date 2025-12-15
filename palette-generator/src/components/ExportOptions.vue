<template>
  <div class="export">
    <h3>Экспорт палитры</h3>
    
    <div class="export-grid">
      <!-- CSS -->
      <div class="export-card">
        <h4>CSS Variables</h4>
        <pre><code>{{ cssVars }}</code></pre>
        <div class="export-actions">
          <button @click="copyCode(cssVars)" class="btn-copy">Копировать</button>
          <button @click="download('css')" class="btn-download">Скачать</button>
        </div>
      </div>

      <!-- SCSS -->
      <div class="export-card">
        <h4>SCSS Variables</h4>
        <pre><code>{{ scssVars }}</code></pre>
        <div class="export-actions">
          <button @click="copyCode(scssVars)" class="btn-copy">Копировать</button>
          <button @click="download('scss')" class="btn-download">Скачать</button>
        </div>
      </div>

      <!-- Tailwind -->
      <div class="export-card">
        <h4>Tailwind Config</h4>
        <pre><code>{{ tailwindConfig }}</code></pre>
        <div class="export-actions">
          <button @click="copyCode(tailwindConfig)" class="btn-copy">Копировать</button>
        </div>
      </div>

      <!-- JSON -->
      <div class="export-card">
        <h4>JSON</h4>
        <pre><code>{{ jsonData }}</code></pre>
        <div class="export-actions">
          <button @click="copyCode(jsonData)" class="btn-copy">Копировать</button>
          <button @click="download('json')" class="btn-download">Скачать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  colors: {
    type: Array,
    default: () => []
  }
})

const cssVars = computed(() => {
  let css = ':root {\n'
  props.colors.forEach((color, i) => {
    css += `  --color-${i + 1}: ${color};\n`
  })
  css += '}'
  return css
})

const scssVars = computed(() => {
  let scss = ''
  props.colors.forEach((color, i) => {
    scss += `$color-${i + 1}: ${color};\n`
  })
  return scss.trim()
})

const tailwindConfig = computed(() => {
  let config = `theme: {\n  colors: {\n`
  props.colors.forEach((color, i) => {
    config += `    'palette-${i + 1}': '${color}',\n`
  })
  config += '  }\n}'
  return config
})

const jsonData = computed(() => {
  return JSON.stringify({
    name: 'Generated Palette',
    colors: props.colors,
    count: props.colors.length,
    generated: new Date().toISOString()
  }, null, 2)
})

const copyCode = async (code) => {
  await navigator.clipboard.writeText(code)
  // Визуальный фидбек
  const btn = event.target
  const original = btn.textContent
  btn.textContent = '✅ Скопировано!'
  btn.style.background = '#48bb78'
  setTimeout(() => {
    btn.textContent = original
    btn.style.background = ''
  }, 1500)
}

const download = (format) => {
  let content, filename, type
  switch (format) {
    case 'css':
      content = cssVars.value
      filename = 'palette.css'
      type = 'text/css'
      break
    case 'scss':
      content = scssVars.value
      filename = 'palette.scss'
      type = 'text/plain'
      break
    case 'json':
      content = jsonData.value
      filename = 'palette.json'
      type = 'application/json'
      break
  }

  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.export { padding: 2rem; background: white; border-radius: 0.5rem; }
.export-grid { 
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 1.5rem; margin-top: 1.5rem; 
}

.export-card { 
  background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; 
  padding: 1.5rem; 
}
.export-card h4 { 
  margin-bottom: 1rem; color: #2d3748; font-size: 1.125rem; 
}

pre { 
  background: #1a202c; color: #e2e8f0; padding: 1rem; 
  border-radius: 0.375rem; overflow-x: auto; margin-bottom: 1rem; 
  font-size: 0.875rem; font-family: 'Monaco', 'Menlo', monospace; 
  max-height: 200px; 
}

.export-actions { display: flex; gap: 0.75rem; }
.btn-copy, .btn-download { 
  flex: 1; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; 
  font-weight: 600; cursor: pointer; font-size: 0.875rem; 
}
.btn-copy { background: #4299e1; color: white; }
.btn-copy:hover { background: #3182ce; }
.btn-download { background: #38a169; color: white; }
.btn-download:hover { background: #2f855a; }
</style>
