<template>
  <div class="data-table">
    <b-row v-if="showFilter" class="mb-2">
      <b-col cols="6">
        <b-input-group>
          <b-form-input v-model="filterKey" placeholder="Filter" />
          <b-input-group-text><i class="bi bi-search" /></b-input-group-text>
        </b-input-group>
      </b-col>
    </b-row>

    <b-table
      v-model:sort-by="sortBy"
      :items="values"
      :fields="fields"
      :filter="filterKey"
      :filter-function="matchesFilter"
      :sort-compare="compareValues"
      :per-page="paginated ? pageSize : 0"
      :current-page="page"
      bordered
      hover
      striped
    >
      <template v-for="column in columns" :key="column.name" #[`cell(${column.name})`]="data">
        <slot v-if="$slots[column.name]" :name="column.name" :value="data.item" />
        <EditableCell
          v-else-if="column.editable"
          :value="data.item[column.name]"
          @save="(newValue) => saveCell(data.item, column.name, newValue)"
        />
        <template v-else>{{ data.item[column.name] }}</template>
      </template>
    </b-table>

    <b-pagination
      v-if="paginated && rowCount > pageSize"
      v-model="page"
      :total-rows="rowCount"
      :per-page="pageSize"
      first-number
      last-number
    />
  </div>
</template>

<script>
import EditableCell from "@/components/EditableCell.vue";

// Replacement for vue2-bootstrap-table2 (Vue 2 only), keeping its interface so
// pages barely change: columns are { name, title, sortable?, editable?,
// cellstyle? }, a slot named after a column renders that column's cell with
// { value: row }, and editing a cell emits cellDataModified(original, new,
// column, row). Filtering, sorting, and paging match the old table: a
// case-insensitive "contains" over every column's raw value, a plain
// comparison of raw values, and 10 rows per page.
export default {
  components: { EditableCell },
  props: {
    columns: { type: Array, required: true },
    values: { type: Array, required: true },
    showFilter: { type: Boolean, default: true },
    sortable: { type: Boolean, default: true },
    paginated: { type: Boolean, default: false },
    pageSize: { type: Number, default: 10 },
    defaultOrderColumn: { type: String, default: null },
    // true = ascending, false = descending (same meaning as the old table)
    defaultOrderDirection: { type: Boolean, default: true },
  },
  emits: ["cellDataModified"],
  data() {
    return {
      filterKey: "",
      page: 1,
      sortBy: this.defaultOrderColumn
        ? [{ key: this.defaultOrderColumn, order: this.defaultOrderDirection ? "asc" : "desc" }]
        : [],
    };
  },
  computed: {
    fields() {
      return this.columns.map((column) => ({
        key: column.name,
        label: column.title,
        sortable: this.sortable && column.sortable !== false,
        tdClass: column.cellstyle,
      }));
    },
    rowCount() {
      return this.filterKey ? this.values.filter((item) => this.matchesFilter(item, this.filterKey)).length : this.values.length;
    },
  },
  watch: {
    filterKey() {
      this.page = 1;
    },
  },
  methods: {
    matchesFilter(item, filter) {
      const needle = String(filter ?? "").toLowerCase();
      if (!needle) {
        return true;
      }
      return this.columns.some((column) => String(item[column.name]).toLowerCase().includes(needle));
    },
    compareValues(a, b, key) {
      const x = a[key];
      const y = b[key];
      if (x === y) return 0;
      if (x === undefined || x === null) return 1;
      if (y === undefined || y === null) return -1;
      return x < y ? -1 : 1;
    },
    saveCell(row, columnName, newValue) {
      const originalValue = row[columnName];
      row[columnName] = newValue;
      this.$emit("cellDataModified", originalValue, newValue, columnName, row);
    },
  },
};
</script>
