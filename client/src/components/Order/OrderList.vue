<template>
  <b-card>
    <b-card-title>Orders</b-card-title>
    <b-card-body>
      <b-button @click="printAllPackingSlips" variant="primary" class="mr-2">Print All</b-button>
      <router-link to="/picks"><b-button variant="primary">Pick List</b-button></router-link>
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
        <template v-slot:total="data"> ${{ Number(data.value.total).toFixed(2) }} </template>
        <template v-slot:actions="data">
          <router-link :to="'/orders/' + data.value.id">
            <b-button class="p-1 mr-1" variant="primary">
              <b-icon-eye-fill />
            </b-button>
          </router-link>
          <b-button class="p-1 mr-1" variant="primary" @click="printPackingSlip(data.value.id)">
            <b-icon-printer-fill />
          </b-button>
          <VueHtml2pdf
            :show-layout="false"
            :float-layout="true"
            :enable-download="false"
            :preview-modal="true"
            filename="myPDF"
            :pdf-quality="2"
            :scale="5"
            :manual-pagination="true"
            pdf-orientation="portrait"
            pdf-content-width="100%"
            :ref="data.value.id"
            :html-to-pdf-options="htmlToPdfOptions"
          >
            <section slot="pdf-content">
              <PackingSlip :order="data.value" />
            </section>
          </VueHtml2pdf>
        </template>
      </vue-bootstrap-table>
      <b-button @click="printAllPackingSlips" variant="primary">Print All</b-button>
      <VueHtml2pdf
        :show-layout="false"
        :float-layout="true"
        :enable-download="false"
        :preview-modal="true"
        filename="myPDF"
        :scale="5"
        :pdf-quality="2"
        :manual-pagination="true"
        pdf-orientation="portrait"
        pdf-content-width="100%"
        ref="allPackingSlips"
        :html-to-pdf-options="htmlToPdfOptions"
      >
        <section slot="pdf-content">
          <div v-for="order in data" :key="order.id" class="packingSlip">
            <PackingSlip :order="order" />
          </div>
        </section>
      </VueHtml2pdf>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";
import VueBootstrapTable from "vue2-bootstrap-table2";
import VueHtml2pdf from "vue-html2pdf";
import PackingSlip from "./PackingSlip";

export default {
  components: {
    VueBootstrapTable: VueBootstrapTable,
    PackingSlip,
    VueHtml2pdf,
  },
  methods: {
    printPackingSlip(orderId) {
      this.$refs[orderId].generatePdf();
    },
    printAllPackingSlips() {
      this.$refs.allPackingSlips.generatePdf();
    },
  },
  data() {
    return {
      data: [],
      htmlToPdfOptions: {
        margin: 0.2,
        image: {
          type: "png",
        },
        jsPDF: {
          unit: "in",
          format: [8, 12],
        },
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
