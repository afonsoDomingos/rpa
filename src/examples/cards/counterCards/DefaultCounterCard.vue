<script setup>
import CountTo from "vue-count-to/src";
import { computed } from "vue";

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
  suffix: {
    type: String,
    default: "",
  },
  duration: {
    type: Number,
    default: 4000,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    validator(value) {
      return [
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "light",
        "dark",
      ].includes(value);
    },
  },
  divider: {
    validator(value) {
      return ["vertical", "horizontal"].includes(value);
    },
  },
});

// Formatar números grandes
const formattedCount = computed(() => {
  if (props.count >= 10000) {
    return { value: Math.floor(props.count / 1000), suffix: 'K' + props.suffix };
  } else if (props.count >= 1000) {
    return { value: props.count / 1000, suffix: 'K' + props.suffix, decimals: 1 };
  }
  return { value: props.count, suffix: props.suffix };
});

// Verificar se é número grande para ajustar tamanho
const isLargeNumber = computed(() => props.count >= 100);
</script>
<template>
  <div class="counter-card-wrapper">
    <div class="counter-circle" :class="{ 'large-number': isLargeNumber }">
      <span class="counter-number" :class="{ 'small-font': isLargeNumber }">
        <template v-if="formattedCount.decimals">
          <CountTo 
            :start-val="0" 
            :end-val="formattedCount.value" 
            :duration="duration"
            :decimals="1"
          />{{ formattedCount.suffix }}
        </template>
        <template v-else>
          <CountTo :start-val="0" :end-val="formattedCount.value" :duration="duration" />{{ formattedCount.suffix }}
        </template>
      </span>
    </div>
    <h5 class="counter-title">{{ title }}</h5>
  </div>
</template>

<style scoped>
.counter-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.counter-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #800080, #6a006a);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(128, 0, 128, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.counter-number {
  font-family: "Poppins", sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  color: white;
  line-height: 1;
  transition: font-size 0.3s ease;
}

.counter-number.small-font {
  font-size: 1rem;
}

.counter-title {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #333;
  margin: 0;
  text-align: center;
}

@media (max-width: 576px) {
  .counter-circle {
    width: 55px;
    height: 55px;
  }
  
  .counter-number {
    font-size: 1rem;
  }
  
  .counter-number.small-font {
    font-size: 0.8rem;
  }
  
  .counter-title {
    font-size: 0.7rem;
  }
}
</style>
