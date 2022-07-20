<template>
  <b-card>
    <b-card-title>Item</b-card-title>
    <b-card-body>
      <b-table stacked :items="item" :fields="fields">
        <template #cell(itemImage)="data">
          <ImageView :images="data.item.images" />
        </template>
        <template #cell(ebayListingId)="data">
          <a v-bind:href="'https://www.ebay.com/itm/' + data.item.ebayListingId" target="_blank">
            {{ data.item.ebayListingId }}
          </a>
        </template>

        <template #cell(description)="data">
          <div style="white-space: pre">
            {{ data.item.description }}
          </div>
        </template>
        <template #cell(specifics)="data">
          <div v-for="(item, index) in data.item.specifics" :key="'specific_' + index">
            {{ item.key }}: {{ item.value }}
          </div>
        </template>
        <template #cell(actions)="data">
          <router-link :to="'/editItem/' + data.item.id">
            <b-button class="p-1 m-1" variant="primary">
              <b-icon-pencil-fill />
            </b-button>
          </router-link>
          <b-button class="p-1 m-1" variant="primary" @click="listItem(data.item.id)"> eBay</b-button>

          <b-button class="p-1 m-1" variant="danger" @click="deleteItem(data.item.id)">
            <b-icon-trash-fill />
          </b-button>
        </template>
      </b-table>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";
import itemUtils from "./itemUtils";
import ImageView from "@/components/ImageView";

export default {
  components: {
    ImageView,
  },
  data() {
    return {
      item: [{}],
      fields: [
        { key: "title", label: "Title" },
        { key: "quantity", label: "Quantity" },
        { key: "price", label: "Price" },
        { key: "soldPrice", label: "Sold Price" },
        { key: "cost", label: "Cost" },
        { key: "location", label: "Location" },
        { key: "ebayConditionId", label: "Condition" },
        {
          key: "description",
          label: "Description",
        },
        { key: "specifics", label: "Specifics" },
        {
          key: "ebayCategoryName",
          label: "eBay Category",
        },
        { key: "soldAt", label: "Sold At" },
        { key: "shippedAt", label: "Shipped At" },
        {
          key: "listingUserId",
          label: "Listing User",
        },
        {
          key: "shippingUserId",
          label: "Shipping User",
        },
        { key: "ownerId", label: "Owner" },

        {
          key: "shipWeightPounds",
          label: "Ship Weight Pounds",
        },
        {
          key: "shipWeightOunces",
          label: "Ship Weight Ounces",
        },

        {
          key: "shipSizeHeightInches",
          label: "Ship Size Height Inches",
        },
        {
          key: "shipSizeWidthInches",
          label: "Ship Size Width Inches",
        },
        {
          key: "shipSizeDepthInches",
          label: "Ship Size Length Inches",
        },
        { key: "ebayListingId", label: "eBay Item ID" },
        { key: "itemImage", label: "Images" },
        { key: "actions", label: "Actions" },
      ],
    };
  },
  async created() {
    const itemId = this.$route.params.id;
    this.token = this.$cookie.get("token");
    this.item = [await api.getItem(this.token, itemId)];
  },
  methods: {
    async listItem(id) {
      await itemUtils.listItem(id, this);
    },
    async deleteItem(id) {
      const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items/" + id;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + this.$cookie.get("token"),
        },
      });
      if (response.status == 204) {
        this.items = this.items.filter((item) => item.id !== id);
      } else {
        console.error(response);
      }
    },
  },
};
</script>
