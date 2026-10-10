<template>
  <b-container fluid class="section m-0">
    <h1>{{ label }}</h1>
    <b-form-select v-model="localValue" :options="options" :required="required" />
  </b-container>
</template>
<script>
export default {
  props: {
    label: { type: String, default: "" },
    modelValue: { type: [Number, String], default: "" },
    options: { type: Array, default: () => [] },
    required: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  computed: {
    localValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>
