<template>
  <b-card>
    <b-card-title>Owner</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input
          v-model="form.name"
          label="Name"
          field="name"
          required
        />
        <form-input
          v-model="form.rate"
          label="Rate"
          field="rate"
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
  components: {
    FormInput,
  },
  data() {
    return {
      form: {
        name: "",
        rate: "",
      },
    };
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();

      const payload = JSON.parse(
        JSON.stringify(this.form),
      );

      payload.rate = parseFloat(payload.rate);

      const url = "/api/v1/owners";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify(payload),
      });
      await response.json();

      this.$router.push({ path: "/owners" });
    },
  },
};
</script>
