<template>
  <b-card>
    <b-card-title>Register</b-card-title>
    <b-card-body>
      <b-alert :model-value="!!error" variant="danger">{{ error }}</b-alert>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col class="m-0 p-0">
              <TextInput v-model="form.name" label="Name" required />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput v-model="form.email" label="Email" required />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput v-model="form.password" label="Password" password required />
            </b-col>
          </b-row>
        </b-container>
        <b-button type="submit" variant="primary">Register</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import TextInput from "@/components/TextInput.vue";
import api from "@/api";

export default {
  components: { TextInput },
  data() {
    return {
      form: { name: "", email: "", password: "" },
      error: "",
    };
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      this.error = "";
      const data = await api.register(this.form);
      if (!data?.access_token) {
        const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
        this.error = message || "Registration failed";
        return;
      }
      this.$cookie.set("token", data.access_token, { expires: "24h" });
      this.$cookie.set("userId", data.id, { expires: "24h" });
      this.$cookie.set("email", data.email, { expires: "24h" });
      this.$router.push({ path: "/" });
    },
  },
};
</script>
