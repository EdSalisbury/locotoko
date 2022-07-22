<template>
  <b-card>
    <b-card-title>Template</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input v-model="form.name" label="Name" field="name" required />

        <ebay-category-chooser v-model="form.ebayCategoryId" />
        <SpecificInput v-model="form.specifics" />

        <form-input v-model="form.title" label="Title" field="title" type="text" />

        <form-input v-model="form.description" label="Description" field="description" type="textarea" />

        <TextInput v-model="form.location" label="Location" />
        <ShippingInput :weight="form.weight" :size="form.size" />

        <b-button type="submit" variant="primary">Add</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import FormInput from "@/components/FormInput";
import EbayCategoryChooser from "@/components/EbayCategoryChooser";
import SpecificInput from "@/components/SpecificInput";
import ShippingInput from "@/components/ShippingInput";
import TextInput from "@/components/TextInput";

export default {
  components: {
    FormInput,
    EbayCategoryChooser,
    SpecificInput,
    ShippingInput,
    TextInput,
  },
  data() {
    return {
      form: {
        name: "",
        ebayCategoryId: 0,
        specifics: [],
        title: "",
        description: "",
        location: "",
        weight: {
          pounds: 0,
          ounces: 0,
        },
        size: {
          width: 0,
          height: 0,
          length: 0,
        },
      },
      ebayCategories: [],
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    const ebayCategories = await api.getEbayCategories(this.token);

    this.ebayCategories = ebayCategories.map((ebayCategory) => ({
      value: ebayCategory.id,
      text: ebayCategory.name,
    }));
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

      payload.specifics = JSON.stringify(this.form.specifics);
      await api.createTemplate(this.token, payload);

      this.$router.push({ path: "/templates" });
    },
  },
};
</script>
