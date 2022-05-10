<template>
  <b-card>
    <b-card-title>Register</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input
          v-model="form.name"
          label="Name"
          field="name"
          type="text"
          required
        />
        <form-input
          v-model="form.email"
          label="Email Address"
          field="email"
          type="email"
          required
        />
        <form-input
          v-model="form.password"
          label="Password"
          field="password"
          type="password"
          required
        />

        <b-button type="submit" variant="primary"
          >Login</b-button
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
        email: "",
        password: "",
      },
    };
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      const url =
        "http://localhost:3333/auth/register";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.form),
      });
      const data = await response.json();
      const token = data.access_token;
      this.$cookie.set("token", token, {
        expires: "24h",
      });
      this.$cookie.set("userId", data.id, {
        expires: "24h",
      });

      this.$router.push({ path: "/" });
    },
  },
};
</script>
