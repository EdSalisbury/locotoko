<template>
  <b-container fluid class="section m-0">
    <h1>{{ label }}</h1>
    <b-form-input
      v-model="localValue"
      :required="required"
      :maxlength="maxLength"
      :minlength="minLength"
      :disabled="disabled"
      :state="checkState ? state : null"
      :type="password ? 'password' : 'text'"
    />
    <b-form-text v-if="maxLength < 999">{{ (modelValue || "").length }}/{{ maxLength }}</b-form-text>
  </b-container>
</template>
<script>
export default {
  props: {
    label: { type: String, default: "" },
    modelValue: { type: [Number, String], default: "" },
    checkState: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    maxLength: { type: Number, default: 999 },
    minLength: { type: Number, default: 0 },
    required: { type: Boolean, default: false },
    password: { type: Boolean, default: false },
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
    state() {
      if (parseInt(this.maxLength) < 999) {
        return this.modelValue?.length <= this.maxLength && this.modelValue?.length >= this.minLength;
      }
      return true;
    },
  },
};
</script>
