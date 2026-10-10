<template>
  <b-card>
    <b-card-title>Add Acquisition</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-2 p-0">
            <b-col class="m-0 p-0">
              <TextInput v-model="form.name" label="Name" required />
            </b-col>
          </b-row>
          <b-row class="m-2 p-0">
            <b-col class="m-0 p-0"> <TextInput v-model="form.price" label="Price" required /> </b-col
          ></b-row>
          <b-row class="m-2 p-0">
            <b-col class="m-0 p-0">
              <DateInput v-model="form.date" label="Date" required />
            </b-col>
          </b-row>
        </b-container>
        <b-button type="submit" variant="primary">Add</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import TextInput from "@/components/TextInput";
import DateInput from "@/components/DateInput";

export default {
  components: {
    TextInput,
    DateInput,
  },
  data() {
    return {
      form: {
        name: "",
        price: 0.0,
        date: "",
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

      let payload = JSON.parse(JSON.stringify(this.form));
      const date = new Date(payload.date);
      payload.date = date.toISOString();
      await api.createAcquisition(this.token, payload);

      this.$router.push({ path: "/acquisitions" });
    },
  },
};
</script>
