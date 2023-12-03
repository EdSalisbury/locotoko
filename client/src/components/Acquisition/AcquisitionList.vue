<template>
  <b-card>
    <b-card-title>Acquisitions</b-card-title>

    <b-card-body>
      <router-link to="/addAcquisition"><b-button variant="primary" class="mb-2">Add</b-button></router-link>
      <b-table hover :items="acquisitions" :fields="fields">
        <template #cell(acquisitionLink)="data">
          <router-link :to="'/acquisitions/' + data.item.id">
            {{ data.item.name }}
          </router-link>
        </template>
        <template #cell(date)="data">
          {{ data.item.date.split("T")[0] }}
        </template>
        <template #cell(actions)="data">
          <router-link :to="'/editAcquisition/' + data.item.id">
            <b-button class="p-1 m-1" variant="primary">
              <b-icon-pencil-fill />
            </b-button>
          </router-link>
          <b-button class="p-1 m-1" variant="success" @click="duplicateAcquisition(data.item.id)">
            <b-icon-file-earmark-plus-fill />
          </b-button>
          <b-button class="p-1 m-1" variant="danger" @click="deleteAcquisition(data.item.id)">
            <b-icon-trash-fill />
          </b-button>
        </template>
      </b-table>
      <router-link to="/addAcquisition"><b-button variant="primary">Add</b-button></router-link>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";

export default {
  data() {
    return {
      acquisitions: [],
      fields: [{ key: "acquisitionLink", label: "Name" }, "price", "date", "actions"],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    this.acquisitions = await api.getAcquisitions(this.token);
  },
  methods: {
    async duplicateAcquisition(id) {
      const acquisition = await api.getAcquisition(this.token, id);
      acquisition.id = "";
      acquisition.name += " Copy";
      acquisition.specifics = JSON.stringify(acquisition.specifics);

      await api.createAcquisition(this.token, acquisition);
      this.acquisitions = await api.getAcquisitions(this.token);
    },
    async deleteAcquisition(id) {
      const response = await api.deleteAcquisition(this.token, id);
      if (response.status == 204) {
        this.acquisitions = this.acquisitions.filter((acquisition) => acquisition.id !== id);
      } else {
        console.error(response);
      }
    },
  },
};
</script>
