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
        <template #cell(description)="data">
          <div style="white-space: pre">
            {{ data.item.description }}
          </div>
        </template>
      </b-table>
    </b-card-body>
  </b-card>
</template>

<script>
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
        { key: "itemImage", label: "Images" },
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
};
</script>
