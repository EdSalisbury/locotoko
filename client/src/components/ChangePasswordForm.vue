<template>
  <b-card>
    <b-card-title>Change Password</b-card-title>
    <b-card-body>
      <b-alert :show="!!error" variant="danger">{{ error }}</b-alert>
      <b-alert :show="!!success" variant="success">{{ success }}</b-alert>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col class="m-0 p-0">
              <TextInput label="Current Password" v-model="form.currentPassword" password required />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput label="New Password" v-model="form.newPassword" password required :minLength="8" />
            </b-col>
          </b-row>
          <b-row class="p-0" style="margin: 10px 0 10px 0">
            <b-col class="m-0 p-0">
              <TextInput label="Confirm New Password" v-model="form.confirmNewPassword" password required />
            </b-col>
          </b-row>
        </b-container>

        <b-button type="submit" variant="primary">Change Password</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import TextInput from "@/components/TextInput";
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
