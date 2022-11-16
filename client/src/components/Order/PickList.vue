<template>
  <b-card>
    <b-card-title>Pick List</b-card-title>
    <b-card-body>
      <vue-bootstrap-table
        :columns="columns"
        :values="data"
        :show-filter="true"
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
        { name: "name", title: "Name" },
        { name: "id", title: "Item ID" },
        { name: "location", title: "Location" },
      ],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    console.log("Created");
    this.data = await api.getPicks(this.token);
  },
};
