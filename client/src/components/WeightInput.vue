<template>
  <b-container>
    <b-row>
      <b-col xs="6">
        <FormInput label="Pounds" v-model="weight.pounds" />
      </b-col>
      <b-col>
        <FormInput label="Ounces" v-model="weight.ounces" />
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import FormInput from "@/components/FormInput";

export default {
  components: {
    FormInput,
  },
  props: {
    value: {
      required: true,
    },
  },
  computed: {
    weight() {
      return this.value;
    },
  },
};
</script>
