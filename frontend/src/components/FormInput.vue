<template>
  <b-form-group
    :id="field + '-input-group'"
    :label="label"
    :label-for="field + '-input'"
  >
    <b-form-input
      :id="field + '-input'"
      type="text"
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
    required: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      required: true,
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
