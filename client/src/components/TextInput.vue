<template>
  <b-container fluid class="section m-0">
    <h1>{{ label }}</h1>
    <b-form-input v-model="localValue" :required="required" maxLength="75" />
  </b-container>
</template>
<script>
export default {
  props: {
    label: String,
    value: [Number, String],
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
