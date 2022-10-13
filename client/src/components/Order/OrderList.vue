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
        <template v-slot:packingSlip="data">
          <VueHtml2pdf
            :show-layout="false"
            :float-layout="true"
            :enable-download="false"
            :preview-modal="true"
            filename="myPDF"
            :pdf-quality="2"
            :manual-pagination="true"
            pdf-format="a6"
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
        <template v-slot:actions="data">
          <router-link :to="'/orders/' + data.value.id">
            <b-button class="p-1 mr-1" variant="primary">
              <b-icon-eye-fill />
            </b-button>
          </router-link>
          <b-button class="p-1 mr-1" variant="primary" @click="printPackingSlip(data.value.id)">
            <b-icon-printer-fill />
          </b-button>
        </template>
      </vue-bootstrap-table>
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
  },
  data() {
    return {
      data: [],
      htmlToPdfOptions: {
        margin: 1,
        jsPDF: {
          format: "a6",
        },
      },
      columns: [
        { name: "name", title: "Name" },
        { name: "total", title: "Total" },
        { name: "actions", title: "Actions" },
        { name: "packingSlip", title: "PackingSlip" },
      ],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    this.data = await api.getOrders(this.token);
  },
};
</script>
