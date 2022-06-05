<template>
  <b-card>
    <b-card-title>Template</b-card-title>
    <b-card-body>
      <b-table
        stacked
        :items="template"
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
      template: [{}],
      fields: ["name", "ebayCategoryId"],
    };
  },
  async created() {
    const templateId = this.$route.params.id;
    const token = this.$cookie.get("token");
    const url =
      process.env.VUE_APP_API_BASE_URL +
      "/api/v1/templates/" +
      templateId;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.template = [await response.json()];
  },
};
</script>
