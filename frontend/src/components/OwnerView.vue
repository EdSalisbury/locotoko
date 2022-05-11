<template>
  <b-card>
    <b-card-title>Owner</b-card-title>
    <b-card-body>
      <b-table
        stacked
        :items="owner"
        :fields="fields"
      >
      </b-table>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  data() {
    return {
      owner: [{}],
      fields: ["name", "rate"],
    };
  },
  async created() {
    const ownerId = this.$route.params.id;
    const token = this.$cookie.get("token");
    const url = "/api/v1/owners/" + ownerId;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.owner = [await response.json()];
  },
};
</script>
