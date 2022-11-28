<template>
  <b-card>
    <b-card-title>Items</b-card-title>
    <b-card-body>
      <b-button-toolbar>
        <b-button-group class="mx-1">
          <router-link to="/addItem"><b-button variant="primary">Add Item</b-button></router-link>
        </b-button-group>
        <b-button-group class="mx-1">
          <b-button variant="primary" @click="showAll">Show All</b-button>
          <b-button variant="primary" @click="showDrafts">Show Drafts</b-button>
          <b-button variant="primary" @click="showActive">Show Active</b-button>
          <b-button variant="primary" @click="showSold">Show Sold</b-button>
        </b-button-group>
      </b-button-toolbar>
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
            <b-button-group class="mx-1" v-if="data.value.status === 'draft'">
              <input
                type="checkbox"
                v-model="data.value.ready"
                style="height: 34px; width: 34px"
                class="p-1"
                @change="ready(data.value.id, data.value.ready)"
              /> </b-button-group
            ><b-button-group class="mx-1">
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

              <b-button v-if="!data.value.ebayListingId" class="p-1" variant="primary" @click="listItem(data.value.id)">
                eBay</b-button
              >

              <b-button class="p-1" variant="success" @click="duplicateItem(data.value.id)">
                <b-icon-file-earmark-plus-fill />
              </b-button>

              <b-button class="p-1" variant="primary" @click="printItemLabel(data.value.id)">
                <b-icon-printer-fill />
              </b-button>
              <b-button
                v-if="!data.value.ebayListingId"
                class="p-1"
                variant="danger"
                @click="deleteItem(data.value.id)"
              >
                <b-icon-trash-fill />
              </b-button> </b-button-group
          ></b-button-toolbar>
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
        { name: "quantity", title: "Qty" },
        { name: "quantitySold", title: "Sold" },
        { name: "price", title: "OP" },
        { name: "currentPrice", title: "CP" },
        { name: "status", title: "Status", visible: false },
        {
          name: "ebayListingId",
          title: "eBay Listing ID",
        },
        {
          name: "weeksActive",
          title: "Weeks",
        },
        { name: "actions", title: "Actions", sortable: false, cellstyle: "text-nowrap" },
      ],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    this.items = await api.getItems(this.token);
    this.items.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

    this.allItems = [...this.items];
    this.activeItems = this.items.filter((item) => item.status === "active");
    this.draftItems = this.items.filter((item) => item.status === "draft");
    this.soldItems = this.items.filter((item) => item.status === "sold");

    console.log(this.draftItems);

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
      this.items = await api.getActiveItems(this.token);
      this.items.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
    },
    async listItem(id) {
      await itemUtils.listItem(id, this);
    },
    async ready(id, value) {
      const item = await api.getItem(this.token, id);
      let errors = [];
      if (value) {
        if (item.title.length > 75) {
          errors.push(`Title too long (${item.title.length} chars)`);
        }
        if (parseFloat(item.price) < 5.99) {
          errors.push(`Original price is under $5.99 ($${parseFloat(item.price).toFixed(2)})`);
        }
        if (item.ebayConditionId === 0) {
          errors.push("Condition not specified");
        }
        if (item.images.length === 0) {
          errors.push("No photos added");
        }
        if (item.images.length > 12) {
          errors.push(`Too many photos (${item.images.length})`);
        }

        if (errors.length > 0) {
          this.$toast.error("Unable to ready item!</br>Reasons:</br>" + errors.join("</br>"), { duration: 0 });
          for (const item of this.items) {
            if (item.id === id) {
              item.ready = false;
              break;
            }
          }
          return false;
        }
      }

      const request = {
        ready: value,
      };
      await api.updateItem(this.token, id, request);
    },
    showAll() {
      this.items = this.allItems.slice();
    },
    showDrafts() {
      this.items = this.draftItems.slice();
    },
    showActive() {
      this.items = this.activeItems.slice();
    },
    showSold() {
      this.items = this.soldItems.slice();
    },
    async deleteItem(id) {
      const response = await api.deleteItem(this.token, id);
      if (response.status == 204) {
        this.items = await api.getActiveItems(this.token);
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
