<template>
  <b-container class="section m-0">
    <h1>Condition</h1>
    <b-form-select v-model="localValue" :options="options" />
  </b-container>
</template>
<script>
export default {
  props: {
    value: String,
    options: Array,
  },
  computed: {
    localValue() {
      return this.value;
    },
  },
};
</script>
