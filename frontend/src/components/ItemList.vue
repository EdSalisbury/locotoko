<template>
  <card>
    <card-title>Items</card-title>
    <card-body>
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
        >Add Item</router-link
      >
    </card-body>
  </card>
</template>

<script>
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
    const url = "http://localhost:3333/items";
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.items = await response.json();
  },
};
</script>
