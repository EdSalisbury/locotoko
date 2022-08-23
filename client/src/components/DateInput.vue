<template>
  <b-container fluid class="section m-0">
    <h1>{{ label }}</h1>
    <b-form-datepicker v-model="localValue" :required="required" />
  </b-container>
</template>
<script>
export default {
  props: {
    label: String,
    value: String,
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
