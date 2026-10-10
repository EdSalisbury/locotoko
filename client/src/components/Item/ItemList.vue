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
          <b-button variant="primary" @click="showEnded">Show Ended</b-button>
        </b-button-group>
      </b-button-toolbar>
      <DataTable
        :columns="columns"
        :values="items"
        :paginated="true"
        default-order-column="updatedAt"
        :default-order-direction="false"
        class="pb-2"
        @cell-data-modified="cellEdited"
      >
        <!-- <template #price="data"> ${{ Number(data.value.price).toFixed(2) }} </template> -->
        <template #shippingPrice="data"> ${{ Number(data.value.shippingPrice).toFixed(2) }} </template>
        <template #totalPrice="data"> ${{ Number(data.value.totalPrice).toFixed(2) }} </template>

        <template #ebayListingId="data">
          <a :href="'https://www.ebay.com/itm/' + data.value.ebayListingId" target="_blank">
            {{ data.value.ebayListingId }}
          </a>
        </template>
        <template #actions="data">
          <b-button-toolbar>
            <b-button-group v-if="data.value.status === 'draft'" class="mx-1">
              <input
v-model="data.value.ready" type="checkbox" style="height: 34px; width: 34px" class="p-1"
                @change="ready(data.value.id, data.value.ready)" /> </b-button-group><b-button-group class="mx-1">
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

              <b-button v-if="!data.value.ebayListingId" class="p-1" variant="primary" @click="listItem(data.value.id)">
                eBay</b-button>

              <b-button class="p-1" variant="success" @click="duplicateItem(data.value.id)">
                <i class="bi bi-file-earmark-plus-fill" />
              </b-button>

              <b-button class="p-1" variant="primary" @click="printItemLabel(data.value.id)">
                <i class="bi bi-printer-fill" />
              </b-button>
              <b-button
class="p-1" :variant="'danger'" @click="data.value.status === 'ended' || data.value.status === 'draft'
                ? deleteItem(data.value.id)
                : endItem(data.value.id)">
                <i class="bi bi-trash-fill" />
              </b-button>
            </b-button-group>
          </b-button-toolbar>
        </template>
      </DataTable>
      <router-link to="/addItem"><b-button variant="primary">Add Item</b-button></router-link>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import itemUtils from "./itemUtils";
import DataTable from "@/components/DataTable.vue";

const MIN_PRICE_THRESHOLD = parseFloat(import.meta.env.VUE_APP_MIN_PRICE || "9.99");

export default {
  components: { DataTable },
  data() {
    return {
      items: [],
      allItems: [],
      categories: [],
      token: "",
      columns: [
        {
          name: "title",
          title: "Title",
        },
        { name: "ebayCategoryName", title: "Category" },
        { name: "location", title: "Location", editable: true },
        { name: "price", title: "Price", editable: true },
        { name: "shippingPrice", title: "Shipping" },
        { name: "markdownPct", title: "% off" },
        { name: "totalPrice", title: "Total" },

        { name: "status", title: "Status", visible: true },
        {
          name: "ebayListingId",
          title: "eBay Listing ID",
        },
        {
          name: "weeksActive",
          title: "Weeks",
        },
        {
          name: "owner",
          title: "Owner",
        },
        {
          name: "updatedAt",
          title: "Updated At",
        },
        { name: "actions", title: "Actions", sortable: false, cellstyle: "text-nowrap" },
      ],
    };
  },

  async created() {
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    await this.getItems();
  },
  methods: {
    // An inline edit in the table (Location or Price): save it, and if the
    // item is listed, revise the eBay listing too. Was a $on listener, which
    // Vue 3 removed; the table now emits cellDataModified.
    async cellEdited(originalValue, newValue, columnTitle, item) {
      const request = {
        [columnTitle]: newValue,
      };
      try {
        await api.updateItem(this.token, item.id, request);
        this.$toast.success("Edit Item Successful");
      } catch (err) {
        this.$toast.error("Edit Item Unsuccessful!</br>Reasons:</br>" + err.response, {
          duration: 0,
        });
        console.error(err);
      }
      if (item.ebayListingId) {
        try {
          const response = await api.updateEbayListing(this.token, item.id, {
            itemId: item.id,
          });
          console.log(response);
          this.$toast.success("Edit eBay Listing Successful");
        } catch (err) {
          let messages = [];

          if (!err.response.data.message) {
            messages = [err.response.data.ShortMessage];
          } else {
            messages = err.response.data.message.map((msg) => {
              return msg.ShortMessage;
            });
          }

          const msgList = "<ul><li>" + messages.join("</li><li>") + "</ul></li>";

          this.$toast.error("Edit eBay Listing Unsuccessful!</br>Reasons:</br>" + msgList, {
            duration: 0,
          });
          console.error(err);
        }
      }
    },
    async getItems() {
      this.allItems = await api.getItems(this.token);
      this.allItems = this.allItems.map((item) => ({
        ...item,
        price: item.price.toFixed(2),
        shippingPrice: parseFloat(item.shippingPrice),
        totalPrice: parseFloat(item.totalPrice),
      }));
      this.items = this.allItems.slice();
    },
    async updateItem(itemId) {
      const newItem = await api.getItem(this.token, itemId);

      newItem.price = parseFloat(newItem.price);
      newItem.shippingPrice = parseFloat(newItem.shippingPrice);
      newItem.totalPrice = parseFloat(newItem.totalPrice);

      // Merge the fresh data into the row in both lists. (The old $set call
      // here was missing an argument, so rows never actually refreshed.) The
      // single-item endpoint doesn't return the owner's name, so keep the
      // row's, and keep the list's two-decimal price format.
      const merge = (row) => ({
        ...row,
        ...newItem,
        owner: row.owner,
        price: Number(newItem.price).toFixed(2),
      });
      const index = this.items.findIndex((item) => item.id === newItem.id);
      if (index >= 0) {
        this.items[index] = merge(this.items[index]);
      }
      const allIndex = this.allItems.findIndex((item) => item.id === newItem.id);
      if (allIndex >= 0) {
        this.allItems[allIndex] = merge(this.allItems[allIndex]);
      }
    },
    async duplicateItem(id) {
      const item = await api.getItem(this.token, id);
      item.id = "";
      item.title += " Copy";
      item.ebayListingId = "";
      item.soldAt = null;
      item.soldPrice = "0.00";
      item.shippedAt = null;
      item.quantitySold = 0;

      item.createdAt = null;
      item.updatedAt = null;
      item.quantity = 1;
      item.location = null;
      item.listedAt = null;
      item.ready = false;
      item.listingUserId = this.$cookie.get("userId");

      item.specifics = JSON.stringify(item.specifics);
      const response = await api.createItem(this.token, item);
      const newItem = await api.getItem(this.token, response.id);
      this.allItems.push(newItem);
      this.items.push(newItem);
      this.updateItem(newItem.id);
    },
    async listItem(id) {
      await itemUtils.listItem(id, this);
      await this.updateItem(id);
    },
    async ready(id, value) {
      const item = await api.getItem(this.token, id);
      let errors = [];

      const ebayConditions = await api.getEbayConditions(this.token, item.ebayCategoryId);

      if (value) {
        if (item.title.length > 80) {
          errors.push(`Title too long (${item.title.length} chars)`);
        }
        if (parseFloat(item.price) < MIN_PRICE_THRESHOLD) {
          errors.push(
            `Original price is under $${MIN_PRICE_THRESHOLD.toFixed(2)} ($${parseFloat(item.price).toFixed(2)})`
          );
        }
        if (item.ebayConditionId === 0 && ebayConditions.length > 0) {
          errors.push("Condition not specified");
        }
        if (item.quantity < 1) {
          errors.push("Quantity is < 1");
        }
        if (item.images.length === 0) {
          errors.push("No photos added");
        }
        if (item.images.length > 12) {
          errors.push(`Too many photos (${item.images.length})`);
        }
        // Same shipping rules the server enforces before listing
        // (src/ebay-listing/listing-problems.ts).
        const pounds = item.shipWeightPounds || 0;
        const ounces = item.shipWeightOunces || 0;
        if (pounds * 16 + ounces <= 0) {
          errors.push(`Shipping weight is missing (${pounds} lb ${ounces} oz)`);
        }
        const dimensions = [
          ["shipSizeDepthInches", "length"],
          ["shipSizeWidthInches", "width"],
          ["shipSizeHeightInches", "height"],
        ];
        for (const [field, label] of dimensions) {
          if (!(item[field] > 0)) {
            errors.push(`Package ${label} is missing`);
          }
        }

        if (errors.length > 0) {
          this.$toast.error("Unable to ready item!<br />Reasons:<br />" + errors.join("<br />"), { duration: 0 });
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
      this.items = this.allItems.filter((item) => item.status === "draft").slice();
    },
    showActive() {
      this.items = this.allItems.filter((item) => item.status === "active").slice();
    },
    showSold() {
      this.items = this.allItems.filter((item) => item.status === "sold").slice();
    },
    showEnded() {
      this.items = this.allItems.filter((item) => item.status === "ended").slice();
    },
    async deleteItem(id) {
      try {
        await api.deleteItem(this.token, id);
        this.$toast.success("Deleted item successfully");
        const index = this.items.findIndex((item) => item.id === id);
        this.items.splice(index, 1);
        const allIndex = this.allItems.findIndex((item) => item.id === id);
        this.allItems.splice(allIndex, 1);
      } catch (e) {
        this.$toast.error("Unable to delete item" + e.response);
        console.error(e.response);
      }
    },
    async endItem(id) {
      try {
        await itemUtils.endItem(id, this);
        this.$toast.success("Ended item successfully");
        const index = this.items.findIndex((item) => item.id === id);
        this.items.splice(index, 1);
        const allIndex = this.allItems.findIndex((item) => item.id === id);
        this.allItems.splice(allIndex, 1);
      } catch (e) {
        this.$toast.error("Unable to end item: " + e.response);
        console.error(e.response);
      }
    },
    async printItemLabel(id) {
      const response = await api.printItemLabel(this.token, id);
      if (response.status == 201) {
        this.$toast.success("Item Label Printed");
      } else {
        this.$toast.error("Unable to print label");
      }
    },
  },
};
</script>
