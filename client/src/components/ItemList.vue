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
            :to="'/items/' + data.item.id"
          >
            {{ data.item.title }}
          </router-link>
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
      ],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    this.items = await api.getItems(token);
  },
};
</script>
