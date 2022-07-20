<template>
  <b-container fluid class="m-0 p-0">
    <b-row class="m-0 p-0">
      <b-col xs="4" class="m-0 pl-0 pr-2">
        <b-container class="section m-0">
          <h1>Condition</h1>
          <b-form-select v-model="localCcndition" :options="conditionOptions" />
        </b-container>
      </b-col>
      <b-col xs="4" class="m-0 pl-0 pr-2">
        <b-container class="section m-0">
          <h1>Quantity</h1>
          <b-form-input v-model="localQuantity" />
        </b-container>
      </b-col>
      <b-col xs="4" class="m-0 pl-0 pr-0">
        <b-container class="section m-0">
          <h1>Location</h1>
          <b-form-input v-model="localLocation" />
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
export default {
  props: {
    condition: String,
    conditionOptions: Array,
  },
};
</script>
