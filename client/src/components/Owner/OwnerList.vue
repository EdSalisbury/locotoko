<template>
  <b-card>
    <b-card-title>Owners</b-card-title>
    <b-card-body>
      <router-link to="/addOwner"><b-button variant="primary" class="mb-2">Add</b-button></router-link>

      <b-table hover :items="owners" :fields="fields">
        <template #cell(ownerLink)="data">
          <router-link :to="'/owners/' + data.item.id">
            {{ data.item.name }}
          </router-link>
        </template>

        <template #cell(actions)="data">
          <router-link :to="'/editOwner/' + data.item.id">
            <b-button class="p-1 m-1" variant="primary">
              <i class="bi bi-pencil-fill" />
            </b-button>
          </router-link>
          <b-button class="p-1 m-1" variant="danger" @click="deleteOwner(data.item.id)">
            <i class="bi bi-trash-fill" />
          </b-button>
        </template>
      </b-table>
      <router-link to="/addOwner"><b-button variant="primary">Add</b-button></router-link>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";

export default {
  data() {
    return {
      owners: [],
      fields: [{ key: "ownerLink", label: "Name" }, "rate", "actions"],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    if (!token) {
      this.$router.push({ path: "/login" });
    }
    this.owners = await api.getOwners(token);
  },
  methods: {
    // Used a URL built from an env variable that isn't set in production.
    async deleteOwner(id) {
      const response = await api.deleteOwner(this.$cookie.get("token"), id);
      if (response.ok) {
        this.owners = this.owners.filter((owner) => owner.id !== id);
      } else {
        console.error(response);
      }
    },
  },
};
</script>
