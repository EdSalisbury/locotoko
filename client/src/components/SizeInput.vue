<template>
  <b-container>
    <b-row>
      <b-col>
        <FormInput v-model="size.width" label="Width" />
      </b-col>
      <b-col>
        <FormInput v-model="size.height" label="Height" />
      </b-col>
      <b-col>
        <FormInput v-model="size.length" label="Length" />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import FormInput from "@/components/FormInput.vue";

// Edits the fields of the size object it's given ({ width, height, length })
// in place, as before.
export default {
  components: { FormInput },
  props: {
    modelValue: { type: Object, required: true },
  },
  computed: {
    size() {
      return this.modelValue;
    },
  },
};
</script>
