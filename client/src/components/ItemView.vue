<template>
  <b-card>
    <b-card-title>Item</b-card-title>
    <b-card-body>
      <b-table stacked :items="item" :fields="fields">
        <template #cell(itemImage)="data">
          <div v-for="(image, index) in data.item.images" :key="index">
            <img :src="image" width="100" height="100" />
          </div>
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
        <template #cell(specifics)>
          <div v-for="(value, index) in Object.entries(itemSpecifics)" :key="index">
            {{ value }}
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
import api from "../api";

export default {
  data() {
    return {
      item: [{}],
      fields: [
        { key: "specifics", label: "Specifics" },
        { key: "title", label: "Title" },
        { key: "quantity", label: "Quantity" },
        { key: "price", label: "Price" },
        { key: "soldPrice", label: "Sold Price" },
        { key: "cost", label: "Cost" },
        { key: "ebayConditionId", label: "Condition" },
        {
          key: "description",
          label: "Description",
        },
        {
          key: "acquisitionDate",
          label: "Acquisition Date",
        },
        {
          key: "ebayCategoryId",
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
          key: "weightPounds",
          label: "Weight Pounds",
        },
        {
          key: "weightOunces",
          label: "Weight Ounces",
        },
        {
          key: "shipWeightPounds",
          label: "Ship Weight Pounds",
        },
        {
          key: "shipWeightOunces",
          label: "Ship Weight Ounces",
        },
        {
          key: "sizeHeightInches",
          label: "Size Height Inches",
        },
        {
          key: "sizeWidthInches",
          label: "Size Width Inches",
        },
        {
          key: "sizeDepthInches",
          label: "Size Depth Inches",
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
          label: "Ship Size Depth Inches",
        },
        { key: "ebayListingId", label: "eBay Item ID" },
        { key: "itemImage", label: "Images" },
        { key: "actions", label: "Actions" },
      ],
    };
  },
  async created() {
    const itemId = this.$route.params.id;
    const token = this.$cookie.get("token");
    const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items/" + itemId;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.item = [await response.json()];
  },
  computed: {
    itemSpecifics() {
      if (!this.item[0].specifics) {
        return {};
      }
      return JSON.parse(this.item[0].specifics);
    },
  },
  methods: {
    async listItem(id) {
      const token = this.$cookie.get("token");
      const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/ebayListings";
      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify({
          itemId: id,
        }),
      });
      if (response.status == 201) {
        this.item = await api.getItem(token, id);
      } else {
        console.error(await response.json());
      }
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
