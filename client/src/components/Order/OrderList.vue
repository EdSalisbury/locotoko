<template>
  <b-card>
    <b-card-title>Orders</b-card-title>
    <b-card-body>
      <vue-bootstrap-table
        :columns="columns"
        :values="data"
        :show-filter="true"
        :show-column-picker="false"
        :sortable="true"
        :paginated="true"
        :selectable="false"
        :multi-column-sortable="false"
        :filter-case-sensitive="false"
        class="pb-2"
      >
        <template v-slot:actions="data">
          <router-link :to="'/orders/' + data.value.id">
            <b-button class="p-1 mr-1" variant="primary">
              <b-icon-eye-fill />
            </b-button>
          </router-link>
        </template>
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
        { name: "total", title: "Total" },
        { name: "actions", title: "Actions" },
      ],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    this.data = await api.getOrders(this.token);
  },
};
</script>
