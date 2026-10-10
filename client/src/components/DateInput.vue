<template>
  <b-container fluid class="section m-0">
    <h1>{{ label }}</h1>
    <!-- bootstrap-vue-next has no datepicker; the browser's native date input
         replaces b-form-datepicker. Clearing the field resets it, as the old
         reset button did. -->
    <b-form-input v-model="localValue" type="date" :required="required" />
  </b-container>
</template>
<script>
export default {
  props: {
    label: { type: String, default: "" },
    // Accepts "YYYY-MM-DD" or a full ISO timestamp from the API.
    modelValue: { type: String, default: "" },
    required: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  computed: {
    localValue: {
      get() {
        return this.modelValue ? String(this.modelValue).slice(0, 10) : "";
      },
      set(value) {
        this.$emit("update:modelValue", value || "");
      },
    },
  },
};
</script>
