<template>
  <b-container>
    <b-row>
      <b-col>
        <FormInput v-model="weight.pounds" label="Pounds" />
      </b-col>
      <b-col>
        <FormInput v-model="weight.ounces" label="Ounces" />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import FormInput from "@/components/FormInput.vue";

// Edits the fields of the weight object it's given ({ pounds, ounces }) in
// place, as before.
export default {
  components: { FormInput },
  props: {
    modelValue: { type: Object, required: true },
  },
  computed: {
    weight() {
      return this.modelValue;
    },
  },
};
</script>
