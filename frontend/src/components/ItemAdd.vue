<template>
  <b-card>
    <b-card-title>Add Item</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input
          v-model="form.title"
          label="Title"
          field="title"
          required
        />
        <b-button type="submit" variant="primary"
          >Add</b-button
        >
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import FormInput from "@/components/FormInput";

export default {
  data() {
    return {
      form: {
        title: "",
      },
    };
  },
  components: {
    FormInput,
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      const url = "http://localhost:3333/items";

      console.log(this.form);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify(this.form),
      });
      await response.json();
      this.$router.push({ path: "/items" });
    },
  },
};
</script>
