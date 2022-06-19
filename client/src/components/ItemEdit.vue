<template>
  <b-card>
    <b-card-title>Edit Item</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input
          label="Template"
          field="template"
          :options="this.templateOptions"
          type="select"
          v-model="form.templateId"
          @input="changeTemplate"
        />
        <ebay-category-chooser v-model="form.ebayCategoryId" :key="form.ebayCategoryId" @input="changeCategory" />

        <form-input
          v-for="name in this.specifics"
          :key="name"
          :label="name"
          :field="name"
          v-model="form.specifics[name]"
          type="text"
          @input="changeSpecifics"
        />
        <form-input
          label="Condition"
          field="ebayConditionId"
          v-model="form.ebayConditionId"
          :options="this.conditions"
          type="select"
        />
        <form-input v-model="form.title" label="Listing Title" field="title" required maxLength="75" />

        <form-input label="Description" field="description" v-model="form.description" type="textarea" />
        <form-input label="Quantity" field="quantity" v-model="form.quantity" type="number" />

        <form-input field="price" label="Price" v-model="form.price" />
        <form-input field="cost" label="Acquisition Cost" v-model="form.cost" />
        <form-input field="location" label="Location" v-model="form.location" />

        <form-input
          label="Listing User"
          field="listingUserId"
          v-model="form.listingUserId"
          :options="this.users"
          type="select"
          required
        />

        <form-input
          label="Owner"
          field="ownerId"
          v-model="form.ownerId"
          :options="this.owners"
          type="select"
          required
        />
        <form-input field="acquisitionDate" label="Aquisition Date" v-model="form.acquisitionDate" type="date" />

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

        <div v-for="(image, index) in this.form.images" :key="index" style="position: relative">
          <b-img style="z-index: 0" :src="image" v-on:click="previewImage" fluid />
          <b-btn style="position: absolute; z-index: 9999; top: 5px; right: 5px" v-on:click.stop="deleteImage(index)"
            ><b-icon-trash-fill
          /></b-btn>
        </div>

        <input type="file" accept="image/*" multiple="true" v-on:change="addImages" />

        <b-button type="submit" variant="primary">Update</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import FormInput from "@/components/FormInput";
import EbayCategoryChooser from "@/components/EbayCategoryChooser";
import api from "@/api";
import util from "@/util";

export default {
  data() {
    return {
      camera: false,
      users: [],
      owners: [],
      template: undefined,
      templates: [],
      templateOptions: [],
      specifics: [],
      conditions: [],
      form: {
        title: "",
        quantity: 1,
        price: 0.0,
        cost: 0.0,
        acquisitionDate: "",
        location: "",
        listingUserId: this.$cookie.get("userId"),
        ebayCategoryId: 0,
        ebayConditionId: 0,
        ownerId: "",
        templateId: "",
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
        images: [],
        specifics: {},
      },
    };
  },
  components: {
    FormInput,
    EbayCategoryChooser,
  },
  async created() {
    const itemId = this.$route.params.id;
    const token = this.$cookie.get("token");

    this.templates = await api.getTemplates(token);
    this.templateOptions = await util.getTemplateOptions(token);
    this.users = await util.getUserOptions(token);
    this.owners = await util.getOwnerOptions(token);

    this.form = await api.getItem(token, itemId);
    this.form.specifics = JSON.parse(this.form.specifics);

    // Handle no template issue more gracefully
    if (this.form.templateId === "0") {
      this.form.templateId = "";
    }

    this.template = this.templates.filter((template) => template.id === this.form.templateId)[0];
  },
  methods: {
    async changeCategory(event) {
      this.conditions = await util.getEbayConditionOptions(this.$cookie.get("token"), event);
    },
    previewImage(event) {
      event.preventDefault();
      alert("Preview");
    },
    deleteImage(index) {
      this.form.images.splice(index, 1);
    },
    addImages(event) {
      event.preventDefault();
      const files = [...event.target.files];
      files.forEach((file) => {
        this.createBase64Image(file);
      });
    },
    changeSpecifics() {
      const conditionName = this.conditions?.find((cond) => cond.value == this.form.ebayConditionId)?.text || "";
      if (this.template?.title) {
        let title = this.template.title;
        this.specifics.forEach((name) => {
          title = title.replaceAll("${" + name + "}", this.form.specifics[name] || "");
        });
        title = title.replaceAll("${Condition}", conditionName || "");
        this.form.title = title;
      }
      if (this.template?.description) {
        let description = this.template.description;
        this.specifics.forEach((name) => {
          description = description.replaceAll("${" + name + "}", this.form.specifics[name] || "");
        });
        description = description.replaceAll("${Condition}", conditionName || "");
        this.form.description = description;
      }
    },
    changeTemplate(event) {
      if (event === "0") {
        this.template = 0;
        this.form.ebayCategoryId = 0;
        this.conditions = [];
        this.specifics = [];
        this.form.specifics = [];
      } else {
        this.template = this.templates.filter((template) => template.id === event)[0];
        this.form.ebayCategoryId = this.template.ebayCategoryId;
        this.specifics = JSON.parse(this.template.specifics);
        this.form.weightPounds = this.template.weightPounds || 0;
        this.form.weightOunces = this.template.weightOunces || 0;
        this.form.shipWeightPounds = this.template.shipWeightPounds || 0;
        this.form.shipWeightOunces = this.template.shipWeightOunces || 0;
        this.form.sizeWidthInches = this.template.sizeWidthInches || 0;
        this.form.sizeHeightInches = this.template.sizeHeightInches || 0;
        this.form.sizeDepthInches = this.template.sizeDepthInches || 0;
        this.form.shipSizeWidthInches = this.template.shipSizeWidthInches || 0;
        this.form.shipSizeHeightInches = this.template.shipSizeHeightInches || 0;
        this.form.shipSizeDepthInches = this.template.shipSizeDepthInches || 0;
      }
    },
    createBase64Image(fileObject) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = e.target.result;
        this.form.images.push(img);
      };
      reader.readAsDataURL(fileObject);
    },

    async onSubmit(event) {
      event.preventDefault();

      this.payload = JSON.parse(JSON.stringify(this.form));

      this.payload.ebayCategoryId = parseInt(this.payload.ebayCategoryId);
      this.payload.ebayConditionId = parseInt(this.payload.ebayConditionId);
      this.payload.quantity = parseInt(this.payload.quantity);
      this.payload.weightPounds = parseInt(this.payload.weightPounds);
      this.payload.weightOunces = parseInt(this.payload.weightOunces);
      this.payload.shipWeightPounds = parseInt(this.payload.shipWeightPounds);
      this.payload.shipWeightOunces = parseInt(this.payload.shipWeightOunces);
      this.payload.sizeWidthInches = parseInt(this.payload.sizeWidthInches);
      this.payload.sizeHeightInches = parseInt(this.payload.sizeHeightInches);
      this.payload.sizeDepthInches = parseInt(this.payload.sizeDepthInches);
      this.payload.shipSizeWidthInches = parseInt(this.payload.shipSizeWidthInches);
      this.payload.shipSizeHeightInches = parseInt(this.payload.shipSizeHeightInches);
      this.payload.shipSizeDepthInches = parseInt(this.payload.shipSizeDepthInches);

      this.payload.cost = parseFloat(this.payload.cost).toFixed(2);
      this.payload.price = parseFloat(this.payload.price).toFixed(2);

      if (this.payload.acquisitionDate == "") {
        delete this.payload.acquisitionDate;
      } else {
        this.payload.acquisitionDate = new Date(this.payload.acquisitionDate).toISOString();
      }

      const token = this.$cookie.get("token");

      const itemId = this.$route.params.id.toString();

      this.payload.specifics = JSON.stringify(this.payload.specifics);

      const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items/" + itemId;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify(this.payload),
      });
      await response.json();

      if (this.form.ebayListingId !== null) {
        await api.updateEbayListing(token, itemId, {
          itemId: itemId,
        });
      }

      this.$router.push({ path: "/items" });
    },
  },
};
</script>
