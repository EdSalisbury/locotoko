<template>
  <b-card>
    <b-card-title>Item</b-card-title>
    <b-card-body>
      <b-table stacked :items="item" :fields="fields">
        <template #cell(itemImage)="data">
          <ImageView :images="data.item.images" />
        </template>
        <template #cell(ebayListingId)="data">
          <a :href="'https://www.ebay.com/itm/' + data.item.ebayListingId" target="_blank">
            {{ data.item.ebayListingId }}
          </a>
        </template>

        <template #cell(description)="data">
          <div style="white-space: pre">
            {{ data.item.description }}
          </div>
        </template>
        <template #cell(specifics)="data">
          <div v-for="(specific, index) in data.item.specifics" :key="'specific_' + index">
            {{ specific.key }}: {{ specific.value }}
          </div>
        </template>
        <template #cell(actions)="data">
          <router-link :to="'/editItem/' + data.item.id">
            <b-button class="p-1 m-1" variant="primary">
              <i class="bi bi-pencil-fill" />
            </b-button>
          </router-link>
          <b-button class="p-1 m-1" variant="primary" @click="listItem(data.item.id)"> eBay</b-button>

          <b-button class="p-1 m-1" variant="danger" @click="deleteItem(data.item.id)">
            <i class="bi bi-trash-fill" />
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
        { key: "listedAt", label: "Listed At" },
        { key: "soldAt", label: "Sold At" },
        { key: "endedAt", label: "Ended At" },
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
        { key: "acquisitionId", label: "Acquisition ID" },
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
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    this.item = [await api.getItem(this.token, itemId)];
  },
  methods: {
    async listItem(id) {
      await itemUtils.listItem(id, this);
    },
    // Used a URL built from an env variable that isn't set in production, and
    // then updated a list this page doesn't have. Now goes through the API and
    // returns to the item list.
    async deleteItem(id) {
      const response = await api.deleteItem(this.token, id);
      if (response.ok) {
        this.$toast.success("Deleted item successfully");
        this.$router.push({ path: "/items" });
      } else {
        this.$toast.error("Unable to delete item");
        console.error(response);
      }
    },
  },
};
</script>
