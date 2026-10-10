<template>
  <div>
    <!-- Bootstrap 5 removed card decks; a row of equal-width columns gives
         the same side-by-side cards. -->
    <b-row class="p-4 g-3" cols="1" cols-md="5">
      <b-col v-for="card in metricCards" :key="card.header">
        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          body-text-variant="primary"
          :header="card.header"
          class="text-center h-100"
          border-variant="primary"
        >
          <b-card-text>{{ card.value }}</b-card-text>
        </b-card>
      </b-col>
    </b-row>
    <b-row class="p-4 g-3" cols="1" cols-md="3">
      <b-col v-for="chart in charts" :key="chart.header">
        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          body-text-variant="primary"
          :header="chart.header"
          class="text-center h-100"
          border-variant="primary"
        >
          <LineChart v-if="loaded" :data="chart.data" />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from "../api";
import { Line as LineChart } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
  components: { LineChart },
  data() {
    return {
      loaded: false,
      sold30Days: 0,
      metrics: {},
      newListings: {
        datasets: [],
      },
      newSales: {
        datasets: [],
      },
      newDrafts: {
        datasets: [],
      },
      newListingAmounts: {
        datasets: [],
      },
      newSalesAmounts: {
        datasets: [],
      },
      newDraftAmounts: {
        datasets: [],
      },
      salesByMonth: {
        datasets: [],
      },
    };
  },
  computed: {
    metricCards() {
      return [
        { header: "Items Listed Today", value: this.metrics.listedToday },
        { header: "Current Drafts", value: this.metrics.currentDrafts },
        { header: "Drafts Created Today", value: this.metrics.createdToday },
        { header: "Items Sold Today", value: this.metrics.soldToday },
        { header: "Sales (30 days)", value: `$${Math.round(this.sold30Days).toLocaleString()}` },
      ];
    },
    charts() {
      return [
        { header: "New eBay Listings (30 days)", data: this.newListings },
        { header: "New Sales (30 days)", data: this.newSales },
        { header: "New Drafts (30 days)", data: this.newDrafts },
      ];
    },
  },
  async created() {
    this.loaded = false;
    try {
      this.token = this.$cookie.get("token");
      if (!this.token) {
        this.$router.push({ path: "/login" });
      }
      this.metrics = await api.getMetrics(this.token);
      for (let metric of this.metrics.newSalesAmounts.slice(-30)) {
        this.sold30Days += metric.y;
      }

      this.newListings = {
        datasets: [
          {
            label: "New Listings",
            backgroundColor: "#457B9D",
            borderColor: "#457B9D",
            pointStyle: false,
            data: this.metrics.newEbayListings.slice(-30),
          },
        ],
      };
      this.newSales = {
        datasets: [
          {
            label: "Sold Listings",
            backgroundColor: "#1D3557",
            borderColor: "#1D3557",
            pointStyle: false,
            data: this.metrics.newSales.slice(-30),
          },
        ],
      };
      this.newDrafts = {
        datasets: [
          {
            label: "New Drafts",
            backgroundColor: "#f33",
            borderColor: "#f33",
            pointStyle: false,
            data: this.metrics.newDrafts.slice(-30),
          },
        ],
      };
      this.newListingAmounts = {
        datasets: [
          {
            label: "New Listing Amounts",
            backgroundColor: "#457B9D",
            borderColor: "#457B9D",
            pointStyle: false,
            data: this.metrics.newEbayListingAmounts.slice(-30),
          },
        ],
      };
      this.loaded = true;
    } catch (e) {
      console.error(e);
    }
  },
};
</script>
