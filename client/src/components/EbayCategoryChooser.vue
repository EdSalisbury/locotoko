<template>
  <b-container fluid class="section">
    <h1>eBay Category</h1>
    <b-row class="section-row">
      <b-col v-for="(level, index) in levels" :key="'ebayCategoryCol-' + index + '-' + keyIndex" class="section-col">
        <b-form-select
          v-if="index === 0 || (levels[index - 1] > 0 && getCategories(levels[index - 1]).length > 0)"
          :id="'ebayCategory-' + index"
          :key="'ebayCategory-' + index + '-' + keyIndex"
          v-model="levels[index]"
          :options="getCategories(levels[index - 1])"
          :required="true"
          @update:model-value="selected(index)"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import api from "@/api";

const optionsMap = (item) => ({ value: item.id, text: item.name });

export default {
  props: {
    modelValue: { type: [Number, String], required: true },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      ebayCategories: [],
      maxLevels: 10,
      levels: [0],
      keyIndex: 0,
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    this.ebayCategories = await api.getEbayCategories(token);

    const value = Number(this.modelValue);
    if (value > 0) {
      const levels = [];
      let level = value;
      while (level > 0) {
        levels.unshift(level);
        const cat = this.ebayCategories.find((c) => c.id === level);
        level = cat.parentId;
        if (cat.parentId === cat.id) {
          level = 0;
        }
      }
      for (let i = levels.length; i < this.maxLevels; i++) {
        levels[i] = 0;
      }
      this.levels = levels;
    } else {
      this.resetCategories(0);
    }
  },
  methods: {
    resetCategories(level) {
      const newLevels = [...this.levels];
      for (let i = level + 1; i < this.maxLevels; i++) {
        newLevels[i] = 0;
      }
      this.levels = newLevels;
      this.keyIndex++;
    },
    // A select changed: clear the levels below it, and if the chosen category
    // has no subcategories it's the final choice, so report it to the parent.
    // (This used to happen inside getCategories during render.)
    selected(index) {
      this.resetCategories(index);
      const chosen = this.levels[index];
      if (chosen > 0 && this.getCategories(chosen).length === 0) {
        this.$emit("update:modelValue", chosen);
      }
    },
    getCategories(parentId = 0) {
      if (!parentId) {
        return this.ebayCategories.filter((cat) => cat.level === 1).map(optionsMap);
      }
      return this.ebayCategories.filter((cat) => cat.parentId === parentId && cat.id !== parentId).map(optionsMap);
    },
  },
};
</script>
