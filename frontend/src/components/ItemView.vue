<template>
  <b-card>
    <b-card-title>Items</b-card-title>
    <b-card-body>
      <b-table stacked :items="item"> </b-table>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  data() {
    return {
      item: [{}],
    };
  },
  async created() {
    const itemId = this.$route.params.id;
    const token = this.$cookie.get("token");
    const url =
      "http://localhost:3333/items/" + itemId;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.item = [await response.json()];
  },
};
</script>
