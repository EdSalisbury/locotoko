<template>
  <b-card>
    <b-card-title>Templates</b-card-title>
    <b-card-body>
      <b-table
        hover
        :items="templates"
        :fields="fields"
      >
        <template #cell(templateLink)="data">
          <router-link
            :to="'/templates/' + data.item.id"
          >
            {{ data.item.name }}
          </router-link>
        </template>

        <template #cell(actions)="data">
          <router-link
            :to="'/editTemplate/' + data.item.id"
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
            @click="deleteTemplate(data.item.id)"
          >
            <b-icon-trash-fill />
          </b-button>
        </template>
      </b-table>
      <router-link to="/addTemplate"
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
      templates: [],
      fields: [
        { key: "templateLink", label: "Name" },
        "actions",
      ],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    this.templates = await api.getTemplates(
      token,
    );
  },
  methods: {
    async deleteTemplate(id) {
      const url =
        process.env.VUE_APP_API_BASE_URL +
        "/api/v1/templates/" +
        id;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
      });
      if (response.status == 204) {
        this.templates = this.templates.filter(
          (template) => template.id !== id,
        );
      } else {
        console.error(response);
      }
    },
  },
};
</script>
