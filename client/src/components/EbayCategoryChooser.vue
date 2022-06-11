<template>
  <b-container>
    <b-row>
      <b-col>
        <b-form-select
          id="ebayCategory-0"
          v-model="levels[0]"
          :options="getCategories(0)"
          @change="resetCategories(0)"
        />
      </b-col>

      <b-col v-if="levels[0] > 0 && getCategories(levels[0]).length > 0">
        <b-form-select
          id="ebayCategory-1"
          v-model="levels[1]"
          :options="getCategories(levels[0])"
          @change="resetCategories(1)"
        />
      </b-col>

      <b-col v-if="levels[1] > 0 && getCategories(levels[1]).length > 0">
        <b-form-select
          id="ebayCategory-2"
          v-model="levels[2]"
          :options="getCategories(levels[1])"
          @change="resetCategories(2)"
        />
      </b-col>

      <b-col v-if="levels[2] > 0 && getCategories(levels[2]).length > 0">
        <b-form-select
          id="ebayCategory-3"
          v-model="levels[3]"
          :options="getCategories(levels[2])"
          @change="resetCategories(3)"
        />
      </b-col>

      <b-col v-if="levels[3] > 0 && getCategories(levels[3]).length > 0">
        <b-form-select
          id="ebayCategory-4"
          v-model="levels[4]"
          :options="getCategories(levels[3])"
          @change="resetCategories(4)"
        />
      </b-col>

      <b-col v-if="levels[4] > 0 && getCategories(levels[4]).length > 0">
        <b-form-select
          id="ebayCategory-5"
          v-model="levels[5]"
          :options="getCategories(levels[4])"
          @change="resetCategories(5)"
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
      maxLevels: 6,
      levels: [0, 0, 0, 0, 0, 0],
    };
  },
  async created() {
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
