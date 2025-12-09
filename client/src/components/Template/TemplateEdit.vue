<template>
  <b-card>
    <b-card-title>Edit Template</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <TextInput label="Name" v-model="form.name" required />
        <ebay-category-chooser v-model="form.ebayCategoryId" />
        <SpecificInput v-model="form.specifics" />
        <TextInput label="Title" v-model="form.title" />

        <b-container fluid class="section">
          <h1>Description</h1>
          <b-form-textarea v-model="form.description" rows="5" max-rows="10" />
        </b-container>

        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col xs="6" class="m-0 pl-0 pr-2">
              <ShippingInput :weight="form.weight" :size="form.size" />
            </b-col>
            <b-col xs="6" class="m-0 pl-0 pr-0"> <TextInput v-model="form.location" label="Location" /></b-col>
          </b-row>
          <b-row class="m-0 pt-2">
            <b-col xs="6" class="m-0 pl-0 pr-2">
              <SelectInput label="Shipping Type" v-model="form.shippingType" :options="shippingTypeOptions" />
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

import EbayCategoryChooser from "@/components/EbayCategoryChooser";
import SpecificInput from "@/components/SpecificInput";
import ShippingInput from "@/components/ShippingInput";
import SelectInput from "@/components/SelectInput";
import TextInput from "@/components/TextInput";
import util from "@/util";

export default {
  components: {
    EbayCategoryChooser,
    SpecificInput,
    ShippingInput,
    SelectInput,
    TextInput,
  },
  data() {
    return {
      shippingTypeOptions: [],
      form: {
        name: "",
        ebayCategoryId: 0,
        specifics: [],
        weight: {
          pounds: 0,
          ounces: 0,
        },
        size: {
          width: 0,
          height: 0,
          length: 0,
        },
        title: "",
        description: "",
        location: "",
        shippingType: "99",
      },
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    const templateId = this.$route.params.id;
    this.form = await api.getTemplate(this.token, templateId);
    this.form.shippingType = String(this.form.shippingType ?? 99);
    this.shippingTypeOptions = util.getShippingTypeOptions();
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();

      let payload = JSON.parse(JSON.stringify(this.form));

      payload.shipWeightPounds = parseInt(payload.weight.pounds);
      payload.shipWeightOunces = parseInt(payload.weight.ounces);

      payload.shipSizeWidthInches = parseInt(payload.size.width);
      payload.shipSizeHeightInches = parseInt(payload.size.height);
      payload.shipSizeDepthInches = parseInt(payload.size.length);

      payload.shippingType = parseInt(payload.shippingType);
      payload.specifics = JSON.stringify(this.form.specifics);

      const templateId = this.$route.params.id;
      await api.updateTemplate(this.token, templateId, payload);

      this.$router.push({ path: "/templates" });
    },
  },
};
</script>
