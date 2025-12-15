<template>
  <div class="color-wheel-visual">
    <h3>Цветовой овал</h3>

    <div class="controls">
      <div class="control-group">
        <label>Режим:</label>
        <select v-model="mode" @change="redrawWheel">
          <option value="single">Один цвет</option>
          <option value="complement">Противоположные</option>
          <option value="analogous">Аналогичные</option>
          <option value="triad">Триада</option>
          <option value="tetrad">Тетрада</option>
        </select>
      </div>

      <div class="control-group">
        <label>Базовый цвет:</label>
        <div class="base-color-selector">
          <input
            v-model="localBaseColor"
            type="color"
            @input="emitBaseColor"
          />
          <input
            v-model="localBaseColor"
            type="text"
            @change="emitBaseColor"
          />
        </div>
      </div>
    </div>

    <div class="wheel-container">
      <canvas
        ref="canvas"
        width="400"
        height="400"
        class="color-wheel"
        @click="handleClick"
      ></canvas>
    </div>

    <div class="colors-list">
      <div
        v-for="(c, i) in harmonyColors"
        :key="i"
        class="color-item"
      >
        <div class="swatch" :style="{ backgroundColor: c }"></div>
        <code>{{ c }}</code>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { hexToHsl, hslToHex } from '../utils/colorUtils.js';

const props = defineProps({
  baseColor: {
    type: String,
    default: '#FF6B6B',
  },
});

const emit = defineEmits(['update:baseColor']);

const canvas = ref(null);
const localBaseColor = ref(props.baseColor);
const mode = ref('single'); // режим гармонии

const harmonyColors = computed(() => {
  const hsl = hexToHsl(localBaseColor.value);
  if (!hsl) return [localBaseColor.value];

  const angles = [];

  switch (mode.value) {
    case 'single':
      angles.push(hsl.h);
      break;
    case 'complement':
      angles.push(hsl.h, (hsl.h + 180) % 360);
      break;
    case 'analogous':
      angles.push((hsl.h - 30 + 360) % 360, hsl.h, (hsl.h + 30) % 360);
      break;
    case 'triad':
      angles.push(hsl.h, (hsl.h + 120) % 360, (hsl.h + 240) % 360);
      break;
    case 'tetrad':
      angles.push(hsl.h, (hsl.h + 90) % 360, (hsl.h + 180) % 360, (hsl.h + 270) % 360);
      break;
  }

  return angles.map(a => hslToHex(a, hsl.s, hsl.l));
});

const drawColorWheel = () => {
  const ctx = canvas.value.getContext('2d');
  const w = canvas.value.width;
  const h = canvas.value.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = 150;

  ctx.clearRect(0, 0, w, h);

  // сам круг
  for (let angle = 0; angle < 360; angle++) {
    const start = (angle - 90) * Math.PI / 180;
    const end = (angle + 1 - 90) * Math.PI / 180;

    ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fill();
  }

  // маркеры гармонии
  const hsl = hexToHsl(localBaseColor.value);
  if (!hsl) return;
  const angles = [];

  switch (mode.value) {
    case 'single':
      angles.push(hsl.h);
      break;
    case 'complement':
      angles.push(hsl.h, (hsl.h + 180) % 360);
      break;
    case 'analogous':
      angles.push((hsl.h - 30 + 360) % 360, hsl.h, (hsl.h + 30) % 360);
      break;
    case 'triad':
      angles.push(hsl.h, (hsl.h + 120) % 360, (hsl.h + 240) % 360);
      break;
    case 'tetrad':
      angles.push(hsl.h, (hsl.h + 90) % 360, (hsl.h + 180) % 360, (hsl.h + 270) % 360);
      break;
  }

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#000000';

  angles.forEach(a => {
    const rad = (a - 90) * Math.PI / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);

    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
};

const redrawWheel = () => {
  if (canvas.value) drawColorWheel();
};

const handleClick = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ctx = canvas.value.getContext('2d');
  const data = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b, a] = data;

  if (a === 0) return; // кликнули вне круга

  const toHex = (v) => v.toString(16).padStart(2, '0').toUpperCase();
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  localBaseColor.value = hex;
  emitBaseColor();
};

const emitBaseColor = () => {
  emit('update:baseColor', localBaseColor.value);
  redrawWheel();
};

onMounted(() => {
  redrawWheel();
});

watch(
  () => props.baseColor,
  (val) => {
    localBaseColor.value = val;
    redrawWheel();
  }
);

watch(mode, () => {
  redrawWheel();
});
</script>

<style scoped>
.color-wheel-visual {
  padding: 20px;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
}
.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.base-color-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}
.base-color-selector input[type='color'] {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.base-color-selector input[type='text'] {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-family: monospace;
}
.wheel-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.color-wheel {
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  cursor: pointer;
}
.colors-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.color-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.swatch {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}
code {
  font-size: 0.8rem;
  font-family: monospace;
}
</style>
