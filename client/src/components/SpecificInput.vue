<template>
  <b-container
    class="rounded"
    fluid
    style="background: #eee; border: 1px solid black; margin: 10px 0 10px 0; padding: 10px"
  >
    <h5>Specifics</h5>
    <b-row v-for="(item, index) in specifics" :key="index">
      <b-col xs="5">
        <b-form-input type="text" v-model="item.key" placeholder="Key" @input="input" />
      </b-col>
      <b-col xs="6">
        <b-form-input type="text" v-model="item.value" placeholder="Value" @input="input" />
      </b-col>
      <b-col xs="1">
        <b-button class="p-1 m-1" variant="danger" @click="deleteItem(index)"><b-icon-dash /></b-button>
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
  },
};
</script>
