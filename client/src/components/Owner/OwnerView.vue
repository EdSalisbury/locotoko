<template>
  <b-card>
    <b-card-title>Owner</b-card-title>
    <b-card-body>
      <b-table stacked :items="owner" :fields="fields"> </b-table>
      <div class="accordion" role="tablist">
        <b-card no-body v-for="(items, index) in this.monthlyItems" :key="index">
          <b-card-header header-tag="header" class="p-0 m-0" role="tab">
            <b-button block v-b-toggle="'accordion' + index" class="p-0 m-0">
              <b-row style="background: #ccc; padding: 5px; margin: 0px">
                <b-col class="text-left"
                  ><b>Total for {{ months[index] }}:</b>
                </b-col>
                <b-col class="text-right">
                  <b>${{ monthlyTotals[index].toFixed(2) }}</b>
                </b-col>
                <b-col class="text-left"><b>Revenue Minus Commission:</b> </b-col>
                <b-col class="text-right">
                  <b>${{ monthlyRevenue[index].toFixed(2) }}</b>
                </b-col>
              </b-row>
            </b-button>
          </b-card-header>
          <b-collapse :id="'accordion' + index" accordion="my-accordion" role="tabpanel">
            <b-card-body class="m-0 p-0">
              <vue-bootstrap-table
                :columns="columns"
                :values="items"
                :show-filter="false"
                :show-column-picker="false"
                :sortable="true"
                :paginated="false"
                :selectable="false"
                :multi-column-sortable="false"
                :filter-case-sensitive="false"
                class="pb-2"
                ref="itemTable"
              >
                <template v-slot:currentPrice="data"> ${{ Number(data.value.currentPrice).toFixed(2) }} </template>
                <template v-slot:price="data"> ${{ Number(data.value.price).toFixed(2) }} </template>

                <template v-slot:ebayListingId="data">
                  <a v-bind:href="'https://www.ebay.com/itm/' + data.value.ebayListingId" target="_blank">
                    {{ data.value.ebayListingId }}
                  </a>
                </template>
                <template v-slot:actions="data">
                  <b-button-toolbar>
                    <b-button-group class="mx-1">
                      <router-link :to="'/viewItem/' + data.value.id">
                        <b-button class="p-1" variant="primary">
                          <b-icon-eye-fill />
                        </b-button>
                      </router-link>

                      <router-link :to="'/editItem/' + data.value.id">
                        <b-button class="p-1" variant="primary">
                          <b-icon-pencil-fill />
                        </b-button>
                      </router-link>
                    </b-button-group>
                  </b-button-toolbar>
                </template>
              </vue-bootstrap-table>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>

      <b-row style="background: #ccc; padding: 5px; margin: 5px; border: 1px black solid">
        <b-col class="text-left"><b>Total:</b> </b-col>
        <b-col class="text-right">
          <b>${{ parseFloat(this.total).toFixed(2) }}</b>
        </b-col>

        <b-col class="text-left"><b>Total Revenue Minus Commission:</b> </b-col>
        <b-col class="text-right">
          <b>${{ parseFloat(this.totalRevenue).toFixed(2) }}</b>
        </b-col>
      </b-row>
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
      this.total += item.soldPrice;
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
      monthlyTotals[key] += item.soldPrice;
      const revenue = item.soldPrice - (1 - rate) * item.soldPrice;
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
