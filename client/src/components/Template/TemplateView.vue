<template>
  <b-card>
    <b-card-title>Template</b-card-title>
    <b-card-body>
      <b-table stacked :items="template" :fields="fields">
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
      template: [{}],
      fields: [
        "name",
        "ebayCategoryId",
        "specifics",
        "title",
        "description",
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
      ],
    };
  },
  async created() {
    const templateId = this.$route.params.id;
    const token = this.$cookie.get("token");
    const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/templates/" + templateId;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.template = [await response.json()];
  },
};
</script>
