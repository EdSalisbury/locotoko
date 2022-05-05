<template>
  <b-form-group
    :id="field + '-input-group'"
    :label="label"
    :label-for="field + '-input'"
  >
    <b-form-input
      :id="field + '-input'"
      type="text"
      :placeholder="title"
      required
    />
  </b-form-group>
</template>

<script>
export default {
  data() {
    return {
      title:
        this.label.charAt(0).toUpperCase() +
        this.label.slice(1),
    };
  },
  props: {
    label: String,
    field: String,
  },
};
</script>
