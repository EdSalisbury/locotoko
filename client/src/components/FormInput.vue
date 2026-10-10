<template>
  <b-form-group :id="field + '-input-group'" :label="label" :label-for="field + '-input'">
    <b-form-select
      v-if="type === 'select'"
      :id="field + '-input'"
      v-model="localValue"
      :placeholder="label"
      :options="options"
      :required="required"
    />
    <b-form-textarea
      v-else-if="type === 'textarea'"
      :id="field + '-input'"
      v-model="localValue"
      :placeholder="label"
      :required="required"
      :rows="rows"
      :max-rows="maxRows"
    />
    <b-form-input
      v-else
      :id="field + '-input'"
      v-model="localValue"
      :type="type"
      :placeholder="label"
      :required="required"
      :state="Number(maxLength) < 9999 ? lengthCheck : null"
    />
    <b-form-invalid-feedback id="input-live-feedback"> Invalid Entry </b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
export default {
  props: {
    label: { type: String, default: "" },
    field: { type: String, default: "" },
    options: { type: Array, default: () => [] },
    maxLength: { type: String, default: "9999" },
    rows: { type: String, default: "3" },
    maxRows: { type: String, default: "6" },
    type: { type: String, default: "text" },
    required: { type: Boolean, default: false },
    modelValue: { type: [String, Number], default: "" },
  },
  emits: ["update:modelValue"],
  computed: {
    localValue: {
      get() {
        return this.modelValue?.toString();
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    lengthCheck() {
      return String(this.modelValue ?? "").length <= Number(this.maxLength);
    },
  },
};
</script>
