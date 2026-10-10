<template>
  <b-card>
    <b-card-title>Pick List</b-card-title>
    <b-card-body>
      <b-button variant="primary" class="m-2" @click="printWindow()">Print</b-button>
      <DataTable :columns="columns" :values="data" :show-filter="false" class="pb-2" />
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import DataTable from "@/components/DataTable.vue";

export default {
  components: { DataTable },
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
  async created() {
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    this.data = await api.getPicks(this.token);
    this.data.sort((a, b) => (a.location > b.location ? 1 : -1));
  },
  methods: {
    printWindow() {
      window.print();
    },
  },
};
</script>
