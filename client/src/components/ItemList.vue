<template>
  <b-card>
    <b-card-title>Items</b-card-title>
    <b-card-body>
      <b-table
        hover
        :items="items"
        :fields="fields"
      >
        <template #cell(itemLink)="data">
          <router-link
            :to="'/viewItem/' + data.item.id"
          >
            {{ data.item.title }}
          </router-link>
        </template>

        <template #cell(actions)="data">
          <router-link
            :to="'/editItem/' + data.item.id"
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
            @click="deleteItem(data.item.id)"
          >
            <b-icon-trash-fill />
          </b-button>
        </template>
      </b-table>
      <router-link to="/addItem"
        ><b-button variant="primary"
          >Add Item</b-button
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
      items: [],
      fields: [
        { key: "itemLink", label: "Title" },
        "quantity",
        "actions",
      ],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    this.items = await api.getItems(token);
  },
  methods: {
    async deleteItem(id) {
      const url =
        process.env.VUE_APP_API_BASE_URL +
        "/api/v1/items/" +
        id;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
      });
      if (response.status == 204) {
        this.items = this.items.filter(
          (item) => item.id !== id,
        );
      } else {
        console.error(response);
      }
    },
  },
};
</script>
