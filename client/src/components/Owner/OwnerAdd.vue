<template>
  <b-card>
    <b-card-title>Add Owner</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col xs="6" class="m-0 pl-0 pr-2">
              <TextInput label="Name" v-model="form.name" required />
            </b-col>
            <b-col xs="6" class="m-0 pl-0 pr-0">
              <TextInput style="margin-top: 10px" label="Rate" v-model="form.rate" required />
            </b-col>
          </b-row>
        </b-container>
        <b-button type="submit" variant="primary">Add</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "../../api";
import TextInput from "@/components/TextInput";
export default {
  components: {
    TextInput,
  },
  data() {
    return {
      form: {
        name: "",
        rate: "",
      },
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();

      const payload = JSON.parse(JSON.stringify(this.form));
      payload.rate = parseFloat(payload.rate);
      await api.createOwner(this.token, payload);
      this.$router.push({ path: "/owners" });
    },
  },
};
</script>
