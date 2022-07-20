<template>
  <b-container fluid class="section m-0">
    <h1>{{ label }}</h1>
    <b-form-input v-model="localValue" />
  </b-container>
</template>
<script>
export default {
  props: {
    label: String,
    value: String,
  },
  computed: {
    localValue() {
      return this.value;
    },
  },
};
</script>
