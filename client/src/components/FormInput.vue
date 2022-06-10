<template>
  <b-form-group :id="field + '-input-group'" :label="label" :label-for="field + '-input'">
    <b-form-select
      v-if="type === 'select'"
      :id="field + '-input'"
      :type="type"
      :placeholder="label"
      :options="options"
      v-model="localValue"
      :required="required"
      @input="input"
      @change="change"
    />
    <b-form-textarea
      v-else-if="type === 'textarea'"
      :id="field + '-input'"
      :type="type"
      :placeholder="label"
      v-model="localValue"
      :required="required"
      :rows="rows"
      :max-rows="maxRows"
      @input="input"
      @change="change"
    />
    <b-form-input
      v-else
      :id="field + '-input'"
      :type="type"
      :placeholder="label"
      v-model="localValue"
      :required="required"
      @input="input"
      @change="change"
      :state="this.maxLength < 9999 ? lengthCheck : null"
    />
    <b-form-invalid-feedback id="input-live-feedback"> Invalid Entry </b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
export default {
  props: {
    label: String,
    field: String,
    format: String,
    options: Array,
    input: {
      type: Function,
      default: function () {},
    },
    change: {
      type: Function,
      default: function () {},
    },
    maxLength: {
      type: String,
      default: "9999",
    },
    rows: {
      type: String,
      default: "3",
    },
    maxRows: {
      type: String,
      default: "6",
    },
    type: {
      type: String,
      default: "text",
    },
    required: {
      type: Boolean,
      default: false,
    },
    value: {
      required: true,
    },
  },
  computed: {
    localValue: {
      get() {
        return this.value?.toString();
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    lengthCheck() {
      return this.value.length > this.maxLength ? false : true;
    },
  },
};
</script>
