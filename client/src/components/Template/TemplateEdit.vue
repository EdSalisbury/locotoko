<template>
  <b-card>
    <b-card-title>Template</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input
          v-model="form.name"
          label="Name"
          field="name"
          required
        />

        <b-form-group
          id="ebayCategory-input-group"
          label="eBay Category"
          label-for="ebayCategory-input"
        >
          <b-form-select
            id="ebayCategory-input"
            v-model="form.ebayCategoryId"
            :options="this.ebayCategories"
          ></b-form-select>
        </b-form-group>

        <form-input
          v-model="form.specifics"
          label="Specifics"
          field="specifics"
          type="textarea"
        />

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

        <b-button type="submit" variant="primary"
          >Update</b-button
        >
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import api from "@/api";
import FormInput from "@/components/FormInput";
export default {
  components: {
    FormInput,
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
      },
      ebayCategories: [],
    };
  },
  async created() {
    const token = this.$cookie.get("token");
    const ebayCategories =
      await api.getEbayCategories(token);

    this.ebayCategories = ebayCategories.map(
      (ebayCategory) => ({
        value: ebayCategory.id,
        text: ebayCategory.name,
      }),
    );

    const templateId = this.$route.params.id;
    this.form = await api.getTemplate(
      token,
      templateId,
    );
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
      const url =
        process.env.VUE_APP_API_BASE_URL +
        "/api/v1/templates/" +
        templateId;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify(payload),
      });
      await response.json();

      this.$router.push({ path: "/templates" });
    },
  },
};
</script>
