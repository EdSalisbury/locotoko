<template>
  <b-card>
    <b-card-title>Template</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input
          v-model="form.name"
          label="Name"
          field="name"
          required
        />

        <b-form-group
          id="ebayCategory-input-group"
          label="eBay Category"
          label-for="ebayCategory-input"
        >
          <b-form-select
            id="ebayCategory-input"
            v-model="form.ebayCategoryId"
            :options="this.ebayCategories"
          ></b-form-select>
        </b-form-group>

        <form-input
          v-model="form.specifics"
          label="Specifics"
          field="specifics"
          type="textarea"
        />

        <b-button type="submit" variant="primary"
          >Add</b-button
        >
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import FormInput from "@/components/FormInput";
export default {
  components: {
    FormInput,
  },
  data() {
    return {
      form: {
        name: "",
        ebayCategoryId: 0,
        specifics: "[\n]",
      },
      ebayCategories: [],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    const ebayCategories =
      await api.getEbayCategories(token);

    this.ebayCategories = ebayCategories.map(
      (ebayCategory) => ({
        value: ebayCategory.id,
        text: ebayCategory.name,
      }),
    );
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();

      const payload = JSON.stringify(
        JSON.parse(JSON.stringify(this.form)),
      );

      const url =
        process.env.VUE_APP_API_BASE_URL +
        "/api/v1/templates";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
        body: payload,
      });
      const res = await response.json();
      console.log(res);

      this.$router.push({ path: "/templates" });
    },
  },
};
</script>
