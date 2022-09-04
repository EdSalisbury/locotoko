<template>
  <b-card>
    <b-card-title>Items</b-card-title>
    <b-card-body>
      <router-link to="/addItem"><b-button variant="primary">Add Item</b-button></router-link>
      <vue-bootstrap-table
        :columns="columns"
        :values="items"
        :show-filter="true"
        :show-column-picker="false"
        :sortable="true"
        :paginated="true"
        :selectable="false"
        :multi-column-sortable="false"
        :filter-case-sensitive="false"
        class="pb-2"
      >
        <template v-slot:ebayListingId="data">
          <a v-bind:href="'https://www.ebay.com/itm/' + data.value.ebayListingId" target="_blank">
            {{ data.value.ebayListingId }}
          </a>
        </template>
        <template v-slot:actions="data">
          <router-link :to="'/viewItem/' + data.value.id">
            <b-button class="p-1 mr-1" variant="primary">
              <b-icon-eye-fill />
            </b-button>
          </router-link>

          <router-link :to="'/editItem/' + data.value.id">
            <b-button class="p-1 mr-1" variant="primary">
              <b-icon-pencil-fill />
            </b-button>
          </router-link>

          <b-button
            v-if="!data.value.ebayListingId"
            class="p-1 mr-1"
            variant="primary"
            @click="listItem(data.value.id)"
          >
            eBay</b-button
          >
          <b-button class="p-1 mr-1" variant="success" @click="duplicateItem(data.value.id)">
            <b-icon-file-earmark-plus-fill />
          </b-button>

          <b-button class="p-1 mr-1" variant="primary" @click="printItemLabel(data.value.id)">
            <b-icon-printer-fill />
          </b-button>

          <b-button
            v-if="!data.value.ebayListingId"
            class="p-1 m-0"
            variant="danger"
            @click="deleteItem(data.value.id)"
          >
            <b-icon-trash-fill />
          </b-button>
        </template>
      </vue-bootstrap-table>
      <router-link to="/addItem"><b-button variant="primary">Add Item</b-button></router-link>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";
import itemUtils from "./itemUtils";
import VueBootstrapTable from "vue2-bootstrap-table2";

export default {
  components: {
    VueBootstrapTable: VueBootstrapTable,
  },
  data() {
    return {
      items: [],
      categories: [],
      token: "",
      columns: [
        {
          name: "title",
          title: "Title",
        },
        { name: "ebayCategoryName", title: "Category" },
        { name: "location", title: "Location", editable: true },
        { name: "quantity", title: "Quantity" },
        { name: "quantitySold", title: "Quantity Sold" },
        { name: "price", title: "Original Price" },
        { name: "currentPrice", title: "Current Price" },
        {
          name: "ebayListingId",
          title: "eBay Listing ID",
        },
        { name: "actions", title: "Actions", sortable: false, cellstyle: "text-nowrap" },
      ],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    this.items = await api.getItems(this.token);
    this.items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    this.$on("cellDataModifiedEvent", async (originalValue, newValue, columnTitle, item) => {
      const request = {
        [columnTitle]: newValue,
      };
      await api.updateItem(this.token, item.id, request);

      if (item.ebayListingId) {
        await api.updateEbayListing(this.token, item.id, { itemId: item.id });
      }
    });
  },
  methods: {
    async duplicateItem(id) {
      const item = await api.getItem(this.token, id);
      item.id = "";
      item.title += " Copy";
      item.ebayListingId = "";
      item.specifics = JSON.stringify(item.specifics);
      await api.createItem(this.token, item);
      this.items = await api.getItems(this.token);
      this.items.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
    },
    async listItem(id) {
      await itemUtils.listItem(id, this);
    },

    async deleteItem(id) {
      const response = await api.deleteItem(this.token, id);
      if (response.status == 204) {
        this.items = await api.getItems(this.token);
        this.items.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
      } else {
        console.error(response);
      }
    },

    async printItemLabel(id) {
      const response = await api.printItemLabel(this.token, id);
      if (response.status == 201) {
        alert("Item Label Printed");
      } else {
        alert("Error printing item label");
      }
    },
  },
};
</script>
