<template>
  <b-container>
    <b-row>
      <b-col v-for="(level, index) in levels" :key="'ebayCategoryCol-' + index">
        <b-form-select
          v-if="index === 0 || (levels[index - 1] > 0 && getCategories(levels[index - 1]).length > 0)"
          :key="'ebayCategory-' + index"
          :id="'ebayCategory-' + index"
          v-model="levels[index]"
          :options="getCategories(levels[index - 1])"
          @change="resetCategories(index)"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import api from "@/api";

const optionsMap = (item) => ({ value: item.id, text: item.name });

export default {
  data() {
    return {
      ebayCategories: [],
      maxLevels: 10,
      levels: [],
    };
  },
  async created() {
    this.resetCategories(0);
    const token = this.$cookie.get("token");
    this.ebayCategories = await api.getEbayCategories(token);
  },
  methods: {
    resetCategories(level) {
      let newLevels = [...this.levels];
      for (let i = level + 1; i < this.maxLevels; i++) {
        newLevels[i] = 0;
      }
      this.levels = newLevels;
    },
    getCategories(parentId = 0) {
      if (!parentId) {
        return this.ebayCategories.filter((cat) => cat.level === 1).map(optionsMap);
      }
      return this.ebayCategories.filter((cat) => cat.parentId === parentId).map(optionsMap);
    },
  },
};
</script>
