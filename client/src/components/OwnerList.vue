<template>
  <b-card>
    <b-card-title>Owners</b-card-title>
    <b-card-body>
      <b-table
        hover
        :items="owners"
        :fields="fields"
      >
        <template #cell(ownerLink)="data">
          <router-link
            :to="'/owners/' + data.item.id"
          >
            {{ data.item.name }}
          </router-link>
        </template>
      </b-table>
      <router-link to="/addOwner"
        ><b-button variant="primary"
          >Add</b-button
        ></router-link
      >
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../api";

export default {
  data() {
    return {
      owners: [],
      fields: [
        { key: "ownerLink", label: "Name" },
        "rate",
      ],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    this.owners = await api.getOwners(token);
  },
};
</script>
