<template>
  <div>
    <div class="p-4">
      <b-card-group deck>
        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="Items Listed Today"
          class="text-center"
          border-variant="primary"
        >
          <b-card-text>{{ this.metrics.listedToday }}</b-card-text>
        </b-card>

        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="Current Drafts"
          class="text-center"
          border-variant="primary"
        >
          <b-card-text>{{ this.metrics.currentDrafts }}</b-card-text>
        </b-card>

        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="Drafts Created Today"
          class="text-center"
          border-variant="primary"
        >
          <b-card-text>{{ this.metrics.createdToday }}</b-card-text>
        </b-card>

        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="Items Sold Today"
          class="text-center"
          border-variant="primary"
        >
          <b-card-text>{{ this.metrics.soldToday }}</b-card-text>
        </b-card>
        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="Sales (30 days)"
          class="text-center"
          border-variant="primary"
        >
          <b-card-text>${{ Math.round(this.sold30Days).toLocaleString() }}</b-card-text>
        </b-card>
      </b-card-group>
    </div>
    <div class="p-4">
      <b-card-group deck>
        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="New eBay Listings (30 days)"
          class="text-center"
          border-variant="primary"
        >
          <LineChart v-if="loaded" :data="newListings" />
        </b-card>
        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="New Sales (30 days)"
          class="text-center"
          border-variant="primary"
        >
          <LineChart v-if="loaded" :data="newSales" />
        </b-card>
        <b-card
          header-bg-variant="primary"
          header-text-variant="white"
          text-variant="primary"
          header="New Drafts (30 days)"
          class="text-center"
          border-variant="primary"
        >
          <LineChart v-if="loaded" :data="newDrafts" />
        </b-card>
      </b-card-group>
    </div>
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
