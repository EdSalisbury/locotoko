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

        <template #cell(actions)="data">
          <router-link
            :to="'/editOwner/' + data.item.id"
          >
            <b-button
              class="p-1 m-1"
              variant="primary"
            >
              <b-icon-pencil-fill />
            </b-button>
          </router-link>
          <b-button
            class="p-1 m-1"
            variant="danger"
            @click="deleteOwner(data.item.id)"
          >
            <b-icon-trash-fill />
          </b-button>
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
import api from "../../api";

export default {
  data() {
    return {
      owners: [],
      fields: [
        { key: "ownerLink", label: "Name" },
        "rate",
        "actions",
      ],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    this.owners = await api.getOwners(token);
  },
  methods: {
    async deleteOwner(id) {
      const url =
        process.env.VUE_APP_API_BASE_URL +
        "/api/v1/owners/" +
        id;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
      });
      if (response.status == 204) {
        this.owners = this.owners.filter(
          (owner) => owner.id !== id,
        );
      } else {
        console.error(response);
      }
    },
  },
};
</script>
