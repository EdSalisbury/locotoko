<template>
  <b-card>
    <b-card-title>Pick List</b-card-title>
    <b-card-body>
      <b-button @click="printWindow()" variant="primary" class="m-2">Print</b-button>
      <vue-bootstrap-table
        :columns="columns"
        :values="data"
        :show-filter="false"
        :show-column-picker="false"
        :sortable="true"
        :paginated="false"
        :page-size="999"
        :selectable="false"
        :multi-column-sortable="false"
        :filter-case-sensitive="false"
        class="pb-2"
      >
      </vue-bootstrap-table>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";
import VueBootstrapTable from "vue2-bootstrap-table2";

export default {
  components: {
    VueBootstrapTable: VueBootstrapTable,
  },
  data() {
    return {
      data: [],
      columns: [
        { name: "location", title: "Location" },
        { name: "title", title: "Title" },
        { name: "id", title: "Item ID" },
      ],
    };
  },
  methods: {
    printWindow: function () {
      window.print();
    },
  },
  async created() {
    this.token = this.$cookie.get("token");
    this.data = await api.getPicks(this.token);
    this.data.sort((a, b) => (a.location > b.location ? 1 : -1));
  },
};
</script>
