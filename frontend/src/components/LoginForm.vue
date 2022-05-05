<template>
  <b-card>
    <b-card-title>Login</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <b-form-group
          id="email-input-group"
          label="Email address:"
          label-for="email-input"
        >
          <b-form-input
            id="email-input"
            v-model="form.email"
            type="email"
            placeholder="Enter email"
            required
          />
        </b-form-group>

        <b-form-group
          id="password-input-group"
          label="Password:"
          label-for="password-input"
        >
          <b-form-input
            id="password-input"
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            required
          />
        </b-form-group>

        <b-button type="submit" variant="primary"
          >Login</b-button
        >
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      const url =
        "http://localhost:3333/auth/login";

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
      this.$router.push({ path: "/" });
    },
  },
};
</script>
