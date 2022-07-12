<template>
  <b-container>
    <b-row>
      <b-col xs="6">
        <FormInput label="Width" v-model="size.width" />
      </b-col>
      <b-col>
        <FormInput label="Height" v-model="size.height" />
      </b-col>
      <b-col>
        <FormInput label="Length" v-model="size.length" />
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
    size() {
      return this.value;
    },
  },
};
</script>
