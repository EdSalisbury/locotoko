<template>
  <b-card>
    <b-card-title>Templates</b-card-title>
    <b-card-body>
      <router-link to="/addTemplate"><b-button variant="primary" class="mb-2">Add</b-button></router-link>
      <b-table hover :items="templates" :fields="fields">
        <template #cell(templateLink)="data">
          <router-link :to="'/templates/' + data.item.id">
            {{ data.item.name }}
          </router-link>
        </template>

        <template #cell(actions)="data">
          <router-link :to="'/editTemplate/' + data.item.id">
            <b-button class="p-1 m-1" variant="primary">
              <b-icon-pencil-fill />
            </b-button>
          </router-link>
          <b-button class="p-1 m-1" variant="success" @click="duplicateTemplate(data.item.id)">
            <b-icon-file-earmark-plus-fill />
          </b-button>
          <b-button class="p-1 m-1" variant="danger" @click="deleteTemplate(data.item.id)">
            <b-icon-trash-fill />
          </b-button>
        </template>
      </b-table>
      <router-link to="/addTemplate"><b-button variant="primary">Add</b-button></router-link>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";

export default {
  data() {
    return {
      templates: [],
      fields: [{ key: "templateLink", label: "Name" }, "actions"],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    this.templates = await api.getTemplates(this.token);
  },
  methods: {
    async duplicateTemplate(id) {
      const template = await api.getTemplate(this.token, id);
      template.id = "";
      template.name += " Copy";
      template.specifics = JSON.stringify(template.specifics);

      await api.createTemplate(this.token, template);
      this.templates = await api.getTemplates(this.token);
    },
    async deleteTemplate(id) {
      const response = await api.deleteTemplate(this.token, id);
      if (response.status == 204) {
        this.templates = this.templates.filter((template) => template.id !== id);
      } else {
        console.error(response);
      }
    },
  },
};
</script>
