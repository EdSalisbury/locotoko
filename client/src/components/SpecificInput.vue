<template>
  <b-container fluid class="section">
    <h1>Specifics</h1>
    <b-row v-for="(item, index) in specifics" :key="index" class="section-row">
      <b-col class="section-col">
        <b-form-input v-model="item.key" type="text" placeholder="Key" :readonly="item.required" @update:model-value="changed" />
      </b-col>
      <b-col class="section-col">
        <b-form-input
          v-model="item.value"
          type="text"
          placeholder="Value"
          :formatter="formatValue"
          @update:model-value="changed"
        />
      </b-col>
      <b-col cols="1" class="section-col">
        <b-button v-if="item.required !== true" class="p-1 m-1" variant="danger" @click="deleteItem(index)">
          <i class="bi bi-dash" />
        </b-button>
      </b-col>
    </b-row>
    <b-button class="p-1 m-1" variant="primary" @click="addItem"><i class="bi bi-plus" /></b-button>
  </b-container>
</template>
<script>
// Edits the specifics array it's given ({ key, value, required? }[]) in
// place, as before, and emits update:modelValue after each change so parents
// can react (e.g. re-render a template title).
export default {
  props: {
    modelValue: { type: Array, required: true },
  },
  emits: ["update:modelValue"],
  computed: {
    specifics() {
      return this.modelValue;
    },
  },
  methods: {
    addItem() {
      this.specifics.push({ key: "", value: "" });
    },
    deleteItem(index) {
      this.specifics.splice(index, 1);
    },
    changed() {
      this.$emit("update:modelValue", this.specifics);
    },
    formatValue(value) {
      return String(value).substring(0, 50);
    },
  },
};
</script>
