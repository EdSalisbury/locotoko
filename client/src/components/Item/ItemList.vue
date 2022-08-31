<template>
  <b-card>
    <b-card-title>Items</b-card-title>
    <b-card-body>
      <router-link to="/addItem"><b-button variant="primary">Add Item</b-button></router-link>
      <b-table hover :items="items" :fields="fields">
        <template #cell(itemLink)="data">
          <router-link :to="'/viewItem/' + data.item.id">
            {{ data.item.title }}{{ data.item.ebayListingId ? "-" + data.item.id.slice(-4) : "" }}
          </router-link>
        </template>

        <template #cell(ebayListingId)="data">
          <a v-bind:href="'https://www.ebay.com/itm/' + data.item.ebayListingId" target="_blank">
            {{ data.item.ebayListingId }}
          </a>
        </template>

        <template #cell(actions)="data">
          <router-link :to="'/editItem/' + data.item.id">
            <b-button class="p-1 m-1" variant="primary">
              <b-icon-pencil-fill />
            </b-button>
          </router-link>
          <b-button v-if="!data.item.ebayListingId" class="p-1 m-1" variant="primary" @click="listItem(data.item.id)">
            eBay</b-button
          >
          <b-button class="p-1 m-1" variant="success" @click="duplicateItem(data.item.id)">
            <b-icon-file-earmark-plus-fill />
          </b-button>

          <b-button class="p-1 m-1" variant="primary" @click="printItemLabel(data.item.id)">
            <b-icon-printer-fill />
          </b-button>

          <b-button v-if="!data.item.ebayListingId" class="p-1 m-1" variant="danger" @click="deleteItem(data.item.id)">
            <b-icon-trash-fill />
          </b-button>
        </template>
      </b-table>
      <router-link to="/addItem"><b-button variant="primary">Add Item</b-button></router-link>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";
import itemUtils from "./itemUtils";

export default {
  data() {
    return {
      items: [],
      categories: [],
      token: "",
      fields: [
        { key: "itemLink", label: "Title" },
        { key: "ebayCategoryName", label: "Category" },
        { key: "location", label: "Location" },
        { key: "quantity", labal: "Quantity" },
        { key: "quantitySold", label: "Quantity Sold" },
        { key: "price", label: "Price" },
        {
          key: "ebayListingId",
          label: "eBay Listing ID",
        },
        "actions",
      ],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    this.items = await api.getItems(this.token);
    this.items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
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
