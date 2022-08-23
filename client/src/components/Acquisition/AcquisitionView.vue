<template>
  <b-card>
    <b-card-title>Acquisition</b-card-title>
    <b-card-body>
      <b-table stacked :items="acquisition" :fields="fields">
        <template #cell(date)="data">
          {{ data.item.date ? data.item.date.split("T")[0] : "" }}
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
      acquisition: [{}],
      fields: ["name", "price", "date"],
    };
  },
  async created() {
    const acquisitionId = this.$route.params.id;
    const token = this.$cookie.get("token");
    this.acquisition = [await api.getAcquisition(token, acquisitionId)];
  },
};
</script>
