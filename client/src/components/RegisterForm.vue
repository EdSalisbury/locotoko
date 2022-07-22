<template>
  <b-card>
    <b-card-title>Register</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col class="m-0 p-0">
              <TextInput label="Name" v-model="form.name" required />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput label="Email" v-model="form.email" required />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput label="Password" v-model="form.password" password required />
            </b-col>
          </b-row>
        </b-container>
        <b-button type="submit" variant="primary">Login</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import TextInput from "@/components/TextInput";
export default {
  components: {
    TextInput,
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
      const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/auth/register";
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
