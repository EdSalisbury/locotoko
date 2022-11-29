<template>
  <b-card>
    <b-card-title>Owner</b-card-title>
    <b-card-body>
      <b-table stacked :items="owner" :fields="fields"> </b-table>

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

      <b-row style="background: #ccc; padding: 5px; margin: 5px; border: 1px black solid">
        <b-col><b>Total:</b> </b-col>
        <b-col class="text-right">
          <b>${{ parseFloat(this.total).toFixed(2) }}</b>
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
      columns: [
        {
          name: "title",
          title: "Title",
        },
        { name: "price", title: "Original Price" },
        { name: "soldPrice", title: "Sold Price" },
        {
          name: "ebayListingId",
          title: "eBay Listing ID",
        },
        { name: "actions", title: "Actions", sortable: false, cellstyle: "text-nowrap" },
      ],
      fields: ["name", "rate"],
      items: [],
    };
  },
  async created() {
    const ownerId = this.$route.params.id;
    this.token = this.$cookie.get("token");
    this.owner = await api.getOwner(this.token, ownerId);
    this.owner = [this.owner];
    const allItems = await api.getItems(this.token);
    this.items = allItems.filter((item) => item.status === "sold" && item.ownerId === ownerId);
    this.total = 0;
    this.items.forEach((item) => (this.total += item.soldPrice));
  },
};
</script>
