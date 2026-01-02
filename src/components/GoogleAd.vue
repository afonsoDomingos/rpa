<template>
  <div class="google-ad-container my-4 text-center">
    <ins
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      :data-ad-format="adFormat"
      :data-full-width-responsive="fullWidthResponsive"
    ></ins>
  </div>
</template>

<script setup>
import { onMounted, nextTick } from "vue";

const props = defineProps({
  adClient: {
    type: String,
    default: "ca-pub-2592660234462216", // ID real do AdSense configurado
  },
  adSlot: {
    type: String,
    required: true,
  },
  adFormat: {
    type: String,
    default: "auto",
  },
  fullWidthResponsive: {
    type: String,
    default: "true",
  },
});

onMounted(async () => {
  await nextTick();
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error("Erro ao carregar Google Ad:", e);
  }
});
</script>

<style scoped>
.google-ad-container {
  min-height: 100px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
