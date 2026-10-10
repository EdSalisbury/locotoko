<template>
  <b-card>
    <b-card-title>Orders</b-card-title>
    <b-card-body>
      <b-button variant="primary" class="me-2" @click="printAllPackingSlips">Print All</b-button>
      <router-link to="/picks"><b-button variant="primary">Pick List</b-button></router-link>
      <DataTable :columns="columns" :values="data" class="pb-2">
        <template #total="row"> ${{ Number(row.value.total).toFixed(2) }} </template>
        <template #actions="row">
          <router-link :to="'/orders/' + row.value.id">
            <b-button class="p-1 me-1" variant="primary">
              <i class="bi bi-eye-fill" />
            </b-button>
          </router-link>
          <b-button class="p-1 me-1" variant="primary" @click="printPackingSlip(row.value)">
            <i class="bi bi-printer-fill" />
          </b-button>
        </template>
      </DataTable>
      <b-button variant="primary" @click="printAllPackingSlips">Print All</b-button>

      <PdfPreview ref="pdf" title="Packing Slips" :options="htmlToPdfOptions">
        <div v-for="order in pdfOrders" :key="order.id" class="packingSlip">
          <PackingSlip :order="order" />
        </div>
      </PdfPreview>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import DataTable from "@/components/DataTable.vue";
import PdfPreview from "@/components/PdfPreview.vue";
import PackingSlip from "./PackingSlip.vue";

export default {
  components: { DataTable, PdfPreview, PackingSlip },
  data() {
    return {
      data: [],
      pdfOrders: [],
      // Same html2pdf.js options as before.
      htmlToPdfOptions: {
        margin: 0.2,
        image: { type: "png" },
        jsPDF: { unit: "in", format: [8, 12] },
      },
      columns: [
        { name: "name", title: "Name" },
        { name: "total", title: "Total" },
        { name: "actions", title: "Actions" },
      ],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    this.data = await api.getOrders(this.token);
  },
  methods: {
    printPackingSlip(order) {
      this.pdfOrders = [order];
      this.$refs.pdf.generatePdf();
    },
    printAllPackingSlips() {
      this.pdfOrders = this.data;
      this.$refs.pdf.generatePdf();
    },
  },
};
</script>

<style scoped>
.packingSlip {
  page-break-after: always;
}

.packingSlip:last-child {
  page-break-after: avoid;
}
</style>
