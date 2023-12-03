<template>
  <b-card>
    <b-card-title>Edit Acquisition</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-2 p-0">
            <b-col class="m-0 p-0">
              <TextInput label="Name" v-model="form.name" required />
            </b-col>
          </b-row>
          <b-row class="m-2 p-0">
            <b-col class="m-0 p-0"> <TextInput label="Price" v-model="form.price" required /> </b-col
          ></b-row>
          <b-row class="m-2 p-0">
            <b-col class="m-0 p-0">
              <DateInput label="Date" v-model="form.date" required />
            </b-col>
          </b-row>
        </b-container>
        <b-button type="submit" variant="primary">Update</b-button>
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
    const acquisitionId = this.$route.params.id;
    this.form = await api.getAcquisition(this.token, acquisitionId);
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();

      let payload = JSON.parse(JSON.stringify(this.form));
      const acquisitionId = this.$route.params.id;
      const date = new Date(payload.date);
      payload.date = date.toISOString();
      await api.updateAcquisition(this.token, acquisitionId, payload);

      this.$router.push({ path: "/acquisitions" });
    },
  },
};
</script>
