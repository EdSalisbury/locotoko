<template>
  <b-form-group
    :id="field + '-input-group'"
    :label="label"
    :label-for="field + '-input'"
  >
    <b-form-textarea
      v-if="type === 'textarea'"
      :id="field + '-input'"
      :type="type"
      :placeholder="label"
      v-model="localValue"
      :required="required"
      :rows="rows"
      :max-rows="maxRows"
    />
    <b-form-input
      v-else
      :id="field + '-input'"
      :type="type"
      :placeholder="label"
      v-model="localValue"
      :required="required"
    />
  </b-form-group>
</template>

<script>
export default {
  props: {
    label: String,
    field: String,
    format: String,
    rows: {
      type: Number,
      default: 3,
    },
    maxRows: {
      type: Number,
      default: 6,
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
  },
};
</script>
