<template>
  <div>
    <b-card>
      <b-card-title>Acquisition</b-card-title>
      <b-card-body>
        <b-table stacked :items="acquisition" :fields="fields">
          <template #cell(date)="data">
            {{ data.item.date ? data.item.date.split("T")[0] : "" }}
          </template>
          <template #cell(costPerItem)="data">
            {{ Number(data.item.costPerItem).toFixed(2) }}
          </template>
        </b-table>
        <DataTable :columns="columns" :values="items" :show-filter="false" class="pb-2">
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
      </b-card-body>
    </b-card>
    <b-card>
      <b-card-header class="p-0 m-0">
        <b-row style="background: #ccc; padding: 5px; margin: 0px">
          <b-col class="text-start"><b>Total:</b> ${{ total.toFixed(2) }}</b-col>
          <b-col class="text-center">
            <b>Total Sold:</b> ${{ soldTotal.toFixed(2) }} ({{ profit.toFixed(2) }})
          </b-col>
          <b-col class="text-end"> <b>Total Unsold:</b> ${{ unsoldTotal.toFixed(2) }} </b-col>
        </b-row>
      </b-card-header>
    </b-card>
  </div>
</template>

<script>
import api from "@/api";
import DataTable from "@/components/DataTable.vue";

export default {
  components: { DataTable },
  data() {
    return {
      acquisition: [{}],
      fields: ["name", "price", "date", "totalItems", "costPerItem"],
      items: [],
      totalItems: 0,
      total: 0,
      unsoldTotal: 0,
      soldTotal: 0,
      profit: 0,
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
    };
  },
  async created() {
    const acquisitionId = this.$route.params.id;
    const token = this.$cookie.get("token");
    if (!token) {
      this.$router.push({ path: "/login" });
    }
    this.acquisition = [await api.getAcquisition(token, acquisitionId)];

    const allItems = await api.getItems(token);
    this.items = allItems.filter((item) => item.acquisitionId === acquisitionId);
    this.acquisition[0].totalItems = this.items.length;
    this.acquisition[0].costPerItem = this.acquisition[0].price / this.items.length;
    this.items.forEach((item) => {
      if (item.soldPrice) {
        this.total += item.soldPrice;
        this.soldTotal += item.soldPrice;
      } else {
        this.unsoldTotal += item.price;
        this.total += item.price;
      }
    });
    this.profit = this.soldTotal - this.acquisition[0].price;
  },
};
</script>
