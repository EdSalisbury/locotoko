<template>
  <b-container fluid class="section m-0">
    <h1>{{ label }}</h1>
    <b-form-input
      v-model="localValue"
      :required="required"
      :maxLength="maxLength"
      :minLength="minLength"
      :state="checkState ? state : null"
      :type="password ? 'password' : 'text'"
    />
    <b-form-text v-if="maxLength < 999">{{ value.length || 0 }}/{{ maxLength }}</b-form-text>
  </b-container>
</template>
<script>
export default {
  props: {
    label: String,
    value: [Number, String],
    checkState: {
      type: Boolean,
      default: false,
    },
    maxLength: {
      type: Number,
      default: 999,
    },
    minLength: {
      type: Number,
      default: 0,
    },
    required: {
      type: Boolean,
      default: false,
    },
    password: {
      type: Boolean,
      default: false,
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
    state() {
      if (parseInt(this.maxLength) < 999) {
        return this.value?.length <= this.maxLength && this.value?.length >= this.minLength;
      }
      return true;
    },
  },
};
</script>
