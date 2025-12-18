<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  labelClass: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:checked"]);
</script>

<template>
  <div class="form-check form-switch">
    <input
      :id="id"
      class="form-check-input"
      type="checkbox"
      :name="id"
      :checked="checked"
      @change="emit('update:checked', $event.target.checked)"
    />
    <label class="form-check-label d-block" :class="labelClass" :for="id"
      ><slot
    /></label>
    <slot name="description" v-if="$slots.description" />
  </div>
</template>
