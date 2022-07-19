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

        <SpecificInput v-model="form.specifics" @input="changeSpecifics" />

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

        <ShippingInput :weight="form.weight" :size="form.size" />

        <ImageView :images="form.images" />

        <CameraInput @photoTaken="photoTaken" />

        <input type="file" accept="image/*" multiple="true" v-on:change="addImages" />

        <b-button type="submit" variant="primary">Update</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import FormInput from "@/components/FormInput";
import EbayCategoryChooser from "@/components/EbayCategoryChooser";
import SpecificInput from "@/components/SpecificInput";
import ShippingInput from "@/components/ShippingInput";
import itemUtils from "./itemUtils";
import ImageView from "@/components/ImageView";
import CameraInput from "@/components/CameraInput";

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
        oldTemplateId: "",
        templateId: "",
        weight: {
          pounds: 0,
          ounces: 0,
        },
        size: {
          width: 0,
          height: 0,
          length: 0,
        },
        images: [],
        specifics: [],
      },
    };
  },
  components: {
    FormInput,
    EbayCategoryChooser,
    SpecificInput,
    ShippingInput,
    ImageView,
    CameraInput,
  },
  async created() {
    const itemId = this.$route.params.id;
    const token = this.$cookie.get("token");

    this.templates = await api.getTemplates(token);
    this.templateOptions = await util.getTemplateOptions(token);
    this.users = await util.getUserOptions(token);
    this.owners = await util.getOwnerOptions(token);
    this.form = await api.getItem(token, itemId);
    this.form.oldTemplateId = this.form.templateId;
    // Handle no template issue more gracefully
    if (this.form.templateId === "0") {
      this.form.templateId = "";
    }

    this.template = this.templates.filter((template) => template.id === this.form.templateId)[0];

    const newImages = [];
    this.form.images.forEach(async (file) => {
      const newFile = util.dataURLtoFile(file, "filename.jpg");
      newImages.push(await itemUtils.resizeImage(newFile));
    });
    this.form.images = newImages;
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
    async addImages(event) {
      event.preventDefault();
      const files = [...event.target.files];
      files.forEach(async (file) => {
        this.form.images.push(await itemUtils.resizeImage(file));
      });
    },
    changeSpecifics() {
      const conditionName = this.conditions?.find((cond) => cond.value == this.form.ebayConditionId)?.text || "";
      if (this.template?.title) {
        let title = this.template.title;
        this.form.specifics.forEach((specific) => {
          title = title.replaceAll("${" + specific.key + "}", specific.value || "");
        });
        title = title.replaceAll("${Condition}", conditionName || "");
        this.form.title = title;
      }
      if (this.template?.description) {
        let description = this.template.description;
        this.form.specifics.forEach((specific) => {
          description = description.replaceAll("${" + specific.key + "}", specific.value || "");
        });
        description = description.replaceAll("${Condition}", conditionName || "");
        this.form.description = description;
      }
    },
    photoTaken(value) {
      this.form.images.push(value);
    },
    changeTemplate(event) {
      if (event === "0") {
        this.template = 0;
        this.form.ebayCategoryId = 0;
        this.conditions = [];
        this.specifics = [];
        this.form.specifics = [];
      } else if (event !== this.form.oldTemplateId) {
        this.template = this.templates.filter((template) => template.id === event)[0];
        this.form.ebayCategoryId = this.template.ebayCategoryId;
        this.form.oldTemplateId = this.template.id;
        this.form.weight.pounds = this.template.shipWeightPounds || 0;
        this.form.weight.ounces = this.template.shipWeightOunces || 0;
        this.form.size.width = this.template.shipSizeWidthInches || 0;
        this.form.size.height = this.template.shipSizeHeightInches || 0;
        this.form.size.length = this.template.shipSizeDepthInches || 0;
      }
    },
    async onSubmit(event) {
      event.preventDefault();

      this.payload = JSON.parse(JSON.stringify(this.form));

      this.payload.ebayCategoryId = parseInt(this.payload.ebayCategoryId);
      this.payload.ebayConditionId = parseInt(this.payload.ebayConditionId);
      this.payload.quantity = parseInt(this.payload.quantity);

      this.payload.shipWeightPounds = parseInt(this.payload.weight.pounds);
      this.payload.shipWeightOunces = parseInt(this.payload.weight.ounces);

      this.payload.shipSizeWidthInches = parseInt(this.payload.size.width);
      this.payload.shipSizeHeightInches = parseInt(this.payload.size.height);
      this.payload.shipSizeDepthInches = parseInt(this.payload.size.length);

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
