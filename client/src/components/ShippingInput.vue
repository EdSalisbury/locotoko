<template>
  <b-container fluid class="section m-0">
    <h1>Shipping</h1>
    <b-row>
      <b-col><WeightInput :model-value="weight" /></b-col>
    </b-row>
    <b-row>
      <b-col><SizeInput :model-value="size" /></b-col>
    </b-row>
  </b-container>
</template>
<script>
import WeightInput from "@/components/WeightInput.vue";
import SizeInput from "@/components/SizeInput.vue";

// The weight and size objects are edited in place by the child inputs, so
// the parent's form sees the changes without any events.
export default {
  components: { WeightInput, SizeInput },
  props: {
    weight: { type: Object, required: true },
    size: { type: Object, required: true },
  },
};
</script>
