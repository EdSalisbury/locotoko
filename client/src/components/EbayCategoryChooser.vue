<template>
  <b-container fluid class="section">
    <h1>eBay Category</h1>
    <b-row class="section-row">
      <b-col
        class="section-col"
        xs="auto"
        v-for="(level, index) in levels"
        :key="'ebayCategoryCol-' + index + '-' + keyIndex"
      >
        <b-form-select
          v-if="index === 0 || (levels[index - 1] > 0 && getCategories(levels[index - 1]).length > 0)"
          :key="'ebayCategory-' + index + '-' + keyIndex"
          :id="'ebayCategory-' + index"
          v-model="levels[index]"
          :options="getCategories(levels[index - 1])"
          @change="resetCategories(index)"
          :required="true"
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
    value: {
      required: true,
    },
  },
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

    if (this.value > 0) {
      this.levels = [];
      let level = this.value;
      while (level > 0) {
        this.levels.unshift(level);
        const cat = this.ebayCategories.filter((cat) => cat.id === level)[0];
        level = cat.parentId;
        if (cat.parentId === cat.id) {
          level = 0;
        }
      }

      for (let i = this.levels.length; i < this.maxLevels; i++) {
        this.levels[i] = 0;
      }
    } else {
      this.resetCategories(0);
    }
  },
  methods: {
    resetCategories(level) {
      let newLevels = this.levels;
      for (let i = level + 1; i < this.maxLevels; i++) {
        newLevels[i] = 0;
      }
      this.levels = newLevels;
      this.keyIndex++;
    },
    getCategories(parentId = 0) {
      if (!parentId) {
        return this.ebayCategories.filter((cat) => cat.level === 1).map(optionsMap);
      }
      const cats = this.ebayCategories
        .filter((cat) => cat.parentId === parentId && cat.id !== parentId)
        .map(optionsMap);
      if (cats.length === 0) {
        let lastLevel = -1;
        for (let level of this.levels) {
          if (level === 0) {
            this.$emit("input", lastLevel);
            return [];
          }
          lastLevel = level;
        }
      }
      return cats;
    },
  },
};
</script>
