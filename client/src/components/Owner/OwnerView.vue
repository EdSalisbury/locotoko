<template>
  <b-card>
    <b-card-title>Owner</b-card-title>
    <b-card-body>
      <b-table stacked :items="owner" :fields="fields" />
      <b-accordion>
        <b-accordion-item v-for="(monthItems, index) in monthlyItems" :key="index" body-class="m-0 p-0">
          <template #title>
            <b-row class="w-100 m-0">
              <b-col class="text-start"><b>Total for {{ months[index] }}:</b></b-col>
              <b-col class="text-end">
                <b>${{ monthlyTotals[index].toFixed(2) }}</b>
              </b-col>
              <b-col class="text-start"><b>Revenue Minus Commission:</b></b-col>
              <b-col class="text-end">
                <b>${{ monthlyRevenue[index].toFixed(2) }}</b>
              </b-col>
            </b-row>
          </template>
          <DataTable :columns="columns" :values="monthItems" :show-filter="false" class="pb-2">
            <template #price="data"> ${{ Number(data.value.price).toFixed(2) }} </template>

            <template #ebayListingId="data">
              <a :href="'https://www.ebay.com/itm/' + data.value.ebayListingId" target="_blank">
                {{ data.value.ebayListingId }}
              </a>
            </template>
            <template #actions="data">
              <b-button-toolbar>
                <b-button-group class="mx-1">
                  <router-link :to="'/viewItem/' + data.value.id">
                    <b-button class="p-1" variant="primary">
                      <i class="bi bi-eye-fill" />
                    </b-button>
                  </router-link>

                  <router-link :to="'/editItem/' + data.value.id">
                    <b-button class="p-1" variant="primary">
                      <i class="bi bi-pencil-fill" />
                    </b-button>
                  </router-link>
                </b-button-group>
              </b-button-toolbar>
            </template>
          </DataTable>
        </b-accordion-item>
      </b-accordion>

      <b-row style="background: #ccc; padding: 5px; margin: 5px; border: 1px black solid">
        <b-col class="text-start"><b>Total:</b> </b-col>
        <b-col class="text-end">
          <b>${{ parseFloat(total).toFixed(2) }}</b>
        </b-col>

        <b-col class="text-start"><b>Total Revenue Minus Commission:</b> </b-col>
        <b-col class="text-end">
          <b>${{ parseFloat(totalRevenue).toFixed(2) }}</b>
        </b-col>
      </b-row>
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
      owner: [{}],
      token: "",
      total: 0.0,
      tableKey: 0,
      columns: [
        {
          name: "title",
          title: "Title",
        },
        { name: "price", title: "Original Price" },
        { name: "soldPrice", title: "Sold Price" },
        { name: "soldAt", title: "Sold Time" },
        {
          name: "ebayListingId",
          title: "eBay Listing ID",
        },
        { name: "actions", title: "Actions", sortable: false, cellstyle: "text-nowrap" },
      ],
      fields: ["name", "rate"],
      items: [],
      monthlyTotals: [],
      monthlyItems: [],
      monthlyRevenue: [],
      months: [],
      totalRevenue: 0,
    };
  },
  async created() {
    const ownerId = this.$route.params.id;
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    this.owner = await api.getOwner(this.token, ownerId);
    const rate = this.owner.rate;
    this.owner = [this.owner];

    const allItems = await api.getItems(this.token);
    this.items = allItems.filter((item) => item.status === "sold" && item.ownerId === ownerId);
    this.total = 0;
    this.totalRevenue = 0;
    var monthlyTotals = [];
    var monthlyItems = [];
    var monthlyRevenue = [];

    this.items.forEach((item) => {
      const soldPrice = parseFloat(item.soldPrice) || 0;
      const shippingPrice = parseFloat(item.shippingPrice) || 0;
      const netSale = soldPrice - shippingPrice;
      this.total += netSale;
      const soldDate = new Date(item.soldAt);
      //const month = soldDate.toLocaleString("default", { month: "long" });
      //const year = soldDate.getFullYear();
      const key = `${soldDate.getFullYear()}-${("0" + (soldDate.getMonth() + 1)).slice(-2)}`;
      if (!monthlyTotals[key]) {
        monthlyTotals[key] = 0;
      }
      if (!monthlyRevenue[key]) {
        monthlyRevenue[key] = 0;
      }
      if (!monthlyItems[key]) {
        monthlyItems[key] = [];
      }
      monthlyItems[key].push(item);
      monthlyTotals[key] += netSale;
      const revenue = netSale - (1 - rate) * netSale;
      monthlyRevenue[key] += revenue;
      this.totalRevenue += revenue;
    });

    const months = Object.keys(monthlyItems).sort();
    months.forEach((key) => {
      this.monthlyItems.push(monthlyItems[key]);
      this.monthlyTotals.push(monthlyTotals[key]);
      this.monthlyRevenue.push(monthlyRevenue[key]);
      this.months.push(key);
    });
  },
};
</script>
