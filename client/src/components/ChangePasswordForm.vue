<template>
  <b-card>
    <b-card-title>Change Password</b-card-title>
    <b-card-body>
      <b-alert :model-value="!!error" variant="danger">{{ error }}</b-alert>
      <b-alert :model-value="!!success" variant="success">{{ success }}</b-alert>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col class="m-0 p-0">
              <TextInput v-model="form.currentPassword" label="Current Password" password required />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput v-model="form.newPassword" label="New Password" password required :min-length="8" />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput v-model="form.confirmNewPassword" label="Confirm New Password" password required />
            </b-col>
          </b-row>
        </b-container>

        <b-button type="submit" variant="primary">Change Password</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import TextInput from "@/components/TextInput.vue";
import api from "@/api";

export default {
  components: {
    TextInput,
  },
  data() {
    return {
      form: {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
      error: "",
      success: "",
    };
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();
      this.error = "";
      this.success = "";

      if (this.form.newPassword !== this.form.confirmNewPassword) {
        this.error = "New password and confirmation do not match";
        return;
      }

      try {
        const token = this.$cookie.get("token");
        await api.changePassword(token, {
          currentPassword: this.form.currentPassword,
          newPassword: this.form.newPassword,
        });
        this.success = "Password updated successfully";
        this.form.currentPassword = "";
        this.form.newPassword = "";
        this.form.confirmNewPassword = "";
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>
