<template>
  <b-form-group
    :id="field + '-input-group'"
    :label="label"
    :label-for="field + '-input'"
  >
    <b-form-input
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
        return this.value;
      },
      set(value) {
        if (this.type == "number") {
          return this.$emit(
            "input",
            parseInt(value),
          );
        }
        this.$emit("input", value);
      },
    },
  },
};
</script>
