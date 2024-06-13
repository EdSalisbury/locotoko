<template>
  <b-container fluid class="section">
    <h1>Specifics</h1>
    <b-row class="section-row" v-for="(item, index) in specifics" :key="index">
      <b-col xs="auto" class="section-col">
        <b-form-input type="text" v-model="item.key" placeholder="Key" @input="input" :readonly="item.required"/>
      </b-col>
      <b-col xs="auto" class="section-col">
        <b-form-input type="text" v-model="item.value" placeholder="Value" @input="input" :formatter="formatValue" />
      </b-col>
      <b-col xs="1" class="section-col" >
        <b-button class="p-1 m-1" variant="danger" @click="deleteItem(index)" v-if="item.required !== true"><b-icon-dash /></b-button>
      </b-col>
    </b-row>
    <b-button class="p-1 m-1" variant="primary" @click="addItem"><b-icon-plus /></b-button>
  </b-container>
</template>
<script>
export default {
  props: {
    value: {
      required: true,
    },
  },
  computed: {
    specifics() {
      return this.value;
    },
  },
  methods: {
    addItem() {
      this.specifics.push({ key: "", value: "" });
    },
    deleteItem(index) {
      this.specifics.splice(index, 1);
    },
    input() {
      this.$emit("input", this.specifics);
    },
    formatValue(value) {
      return String(value).substring(0, 50);
    },
  },
};
</script>
