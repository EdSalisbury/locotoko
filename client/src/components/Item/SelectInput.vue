<template>
  <b-container class="section m-0">
    <h1>{{ label }}</h1>
    <b-form-select v-model="localValue" :options="options" :required="required" />
  </b-container>
</template>
<script>
export default {
  props: {
    label: String,
    value: [Number, String],
    options: Array,
    required: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    localValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>
