<template>
  <span v-if="!editing" class="editable-field" title="Double-click to edit" @dblclick="start">{{ value }}</span>
  <b-input-group v-else size="sm">
    <b-form-input ref="input" v-model="draft" @keyup.enter="save" @keyup.esc="cancel" />
    <b-button variant="danger" @click="cancel"><i class="bi bi-x-lg" /></b-button>
    <b-button variant="primary" @click="save"><i class="bi bi-check-lg" /></b-button>
  </b-input-group>
</template>

<script>
// Double-click to edit, Enter or the check button saves, Esc or the X
// cancels: same behavior as vue2-bootstrap-table2's editable cells.
export default {
  props: {
    value: { type: [String, Number], default: "" },
  },
  emits: ["save"],
  data() {
    return { editing: false, draft: "" };
  },
  methods: {
    start() {
      this.draft = this.value ?? "";
      this.editing = true;
    },
    save() {
      this.editing = false;
      this.$emit("save", this.draft);
    },
    cancel() {
      this.editing = false;
    },
  },
};
</script>

<style scoped>
.editable-field {
  cursor: pointer;
}
</style>
