<template>
  <b-container fluid class="section m-0">
    <h1>Shipping</h1>
    <b-row>
      <b-col xs="6"><WeightInput v-model="localWeight" /> </b-col>
    </b-row>
    <b-row>
      <b-col xs="6"><SizeInput v-model="localSize" /> </b-col>
    </b-row>
  </b-container>
</template>
<script>
import WeightInput from "@/components/WeightInput";
import SizeInput from "@/components/SizeInput";

export default {
  components: {
    WeightInput,
    SizeInput,
  },
  props: {
    weight: {
      required: true,
    },
    size: {
      required: true,
    },
  },
  computed: {
    localWeight: {
      get() {
        return this.weight;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    localSize: {
      get() {
        return this.size;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
};
</script>
