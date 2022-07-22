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
        <template #cell(specifics)="data">
          <div v-for="(item, index) in data.item.specifics" :key="'specific_' + index">
            {{ item.key }}: {{ item.value }}
          </div>
        </template>
      </b-table>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";

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
        "location",
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
    this.template = [await api.getTemplate(token, templateId)];
  },
};
</script>
