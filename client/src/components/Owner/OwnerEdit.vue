<template>
  <b-card>
    <b-card-title>Edit Owner</b-card-title>
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
        <b-button type="submit" variant="primary">Update</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
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
    console.log("WTF");
    this.token = this.$cookie.get("token");
    const ownerId = this.$route.params.id;
    console.log(ownerId);
    this.form = await api.getOwner(this.token, ownerId);
    console.log(this.form);
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();

      let payload = JSON.parse(JSON.stringify(this.form));
      payload.rate = parseFloat(payload.rate);
      const ownerId = this.$route.params.id;
      await api.updateOwner(this.token, ownerId, payload);
      this.$router.push({ path: "/owners" });
    },
  },
};
</script>
