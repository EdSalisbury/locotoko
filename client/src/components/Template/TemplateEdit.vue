<template>
  <b-card>
    <b-card-title>Template</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input v-model="form.name" label="Name" field="name" required />

        <ebay-category-chooser v-model="form.ebayCategoryId" />

        <form-input v-model="form.specifics" label="Specifics" field="specifics" type="textarea" />

        <form-input v-model="form.title" label="Title" field="title" type="text" />

        <form-input v-model="form.description" label="Description" field="description" type="textarea" />
        <form-input field="weightPounds" label="Weight (Lbs.)" v-model="form.weightPounds" type="number" />
        <form-input field="weightOunces" label="Weight (Oz.)" v-model="form.weightOunces" type="number" />

        <form-input
          field="shipWeightPounds"
          label="Shipping Weight (Lbs.)"
          v-model="form.shipWeightPounds"
          type="number"
        />
        <form-input
          field="shipWeightOunces"
          label="Shipping Weight (Oz.)"
          v-model="form.shipWeightOunces"
          type="number"
        />

        <form-input field="sizeWidthInches" label="Width (In.)" v-model="form.sizeWidthInches" type="number" />
        <form-input field="sizeHeightInches" label="Height (In.)" v-model="form.sizeHeightInches" type="number" />
        <form-input field="sizeDepthInches" label="Depth (In.)" v-model="form.sizeDepthInches" type="number" />

        <form-input
          field="shipSizeWidthInches"
          label="Ship Width (In.)"
          v-model="form.shipSizeWidthInches"
          type="number"
        />
        <form-input
          field="shipSizeHeightInches"
          label="Ship Height (In.)"
          v-model="form.shipSizeHeightInches"
          type="number"
        />
        <form-input
          field="shipSizeDepthInches"
          label="Ship Depth (In.)"
          v-model="form.shipSizeDepthInches"
          type="number"
        />

        <b-button type="submit" variant="primary">Update</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import FormInput from "@/components/FormInput";

import EbayCategoryChooser from "@/components/EbayCategoryChooser";

export default {
  components: {
    FormInput,
    EbayCategoryChooser,
  },
  data() {
    return {
      form: {
        name: "",
        ebayCategoryId: 0,
        specifics: "[\n]",
        weightPounds: 0,
        weightOunces: 0,
        shipWeightPounds: 0,
        shipWeightOunces: 0,
        sizeWidthInches: 0,
        sizeHeightInches: 0,
        sizeDepthInches: 0,
        shipSizeWidthInches: 0,
        shipSizeHeightInches: 0,
        shipSizeDepthInches: 0,
        title: "",
        description: "",
      },
    };
  },
  async created() {
    this.token = this.$cookie.get("token");

    const templateId = this.$route.params.id;
    this.form = await api.getTemplate(this.token, templateId);
  },
  methods: {
    async onSubmit(event) {
      event.preventDefault();

      let payload = JSON.parse(JSON.stringify(this.form));

      payload.weightPounds = parseInt(payload.weightPounds);
      payload.weightOunces = parseInt(payload.weightOunces);
      payload.shipWeightPounds = parseInt(payload.shipWeightPounds);
      payload.shipWeightOunces = parseInt(payload.shipWeightOunces);
      payload.sizeWidthInches = parseInt(payload.sizeWidthInches);
      payload.sizeHeightInches = parseInt(payload.sizeHeightInches);
      payload.sizeDepthInches = parseInt(payload.sizeDepthInches);
      payload.shipSizeWidthInches = parseInt(payload.shipSizeWidthInches);
      payload.shipSizeHeightInches = parseInt(payload.shipSizeHeightInches);
      payload.shipSizeDepthInches = parseInt(payload.shipSizeDepthInches);

      const templateId = this.$route.params.id;
      await api.updateTemplate(this.token, templateId, payload);

      this.$router.push({ path: "/templates" });
    },
  },
};
</script>
