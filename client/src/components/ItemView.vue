<template>
  <b-card>
    <b-card-title>Item</b-card-title>
    <b-card-body>
      <b-table
        stacked
        :items="item"
        :fields="fields"
      >
        <template #cell(itemImage)="data">
          <div
            v-for="(image, index) in data.item
              .images"
            :key="index"
          >
            <img :src="image" />
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
        { key: "title", label: "Title" },
        {
          key: "description",
          label: "Description",
        },
        { key: "itemImage", label: "Images" },
      ],
    };
  },
  async created() {
    const itemId = this.$route.params.id;
    const token = this.$cookie.get("token");
    const url =
      process.env.VUE_APP_API_BASE_URL +
      "/api/v1/items/" +
      itemId;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.item = [await response.json()];
  },
};
</script>
