<template>
  <b-table stacked :items="item"> </b-table>
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
