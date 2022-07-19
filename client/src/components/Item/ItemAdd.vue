<template>
  <b-card>
    <b-card-title>Add Item</b-card-title>
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
          @input="changeSpecifics"
        />

        <form-input v-model="form.title" label="Listing Title" field="title" required maxLength="75" />

        <b-form-group id="description-input-group" label="Description" label-for="description-input">
          <b-form-textarea
            id="description-input"
            v-model="form.description"
            placeholder="Description"
            rows="3"
            max-rows="6"
          ></b-form-textarea>
        </b-form-group>
        <form-input label="Quantity" field="quantity" v-model="form.quantity" type="number" />
        <form-input field="price" label="Price" v-model="form.price" required />
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

        <form-input field="cost" label="Acquisition Cost" v-model="form.cost" />

        <form-input field="acquisitionDate" label="Acquisition Date" v-model="form.acquisitionDate" type="date" />

        <ShippingInput :weight="form.weight" :size="form.size" />

        <ImageView :images="form.images" @deleteImage="deleteImage" :edit="true" />

        <CameraInput @photoTaken="photoTaken" />

        <input type="file" accept="image/*" multiple="true" v-on:change="addImages" />

        <b-button type="submit" variant="primary">Add</b-button>
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
      users: [],
      owners: [],
      templates: [],
      template: undefined,
      templateOptions: [],
      conditions: [],
      form: {
        title: "",
        quantity: 1,
        price: 0.0,
        cost: 0.0,
        description: "",
        acquisitionDate: "",
        listingUserId: this.$cookie.get("userId"),
        ebayCategoryId: 0,
        ebayConditionId: 0,
        location: "",
        ownerId: "",
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
    const token = this.$cookie.get("token");
    this.templates = await api.getTemplates(token);
    this.templateOptions = await util.getTemplateOptions(token);
    this.users = await util.getUserOptions(token);
    this.owners = await util.getOwnerOptions(token);
  },
  methods: {
    async changeCategory(event) {
      this.conditions = await util.getEbayConditionOptions(this.$cookie.get("token"), event);
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
    changeTemplate(event) {
      if (event === "0") {
        this.template = 0;
        this.form.ebayCategoryId = 0;
        this.conditions = [];
        this.form.specifics = [];
      } else {
        this.template = this.templates.find((template) => template.id === event);
        this.form.ebayCategoryId = this.template.ebayCategoryId || 0;
        this.form.specifics = JSON.parse(this.template.specifics) || [];

        this.form.weight.pounds = this.template.shipWeightPounds || 0;
        this.form.weight.ounces = this.template.shipWeightOunces || 0;
        this.form.size.width = this.template.shipSizeWidthInches || 0;
        this.form.size.height = this.template.shipSizeHeightInches || 0;
        this.form.size.length = this.template.shipSizeDepthInches || 0;

        this.changeSpecifics();
      }
    },
    photoTaken(value) {
      this.form.images.push(value);
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

      this.payload.specifics = JSON.stringify(this.payload.specifics);

      const url = process.env.VUE_APP_API_BASE_URL + "/api/v1/items";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify(this.payload),
      });
      await response.json();
      this.$router.push({ path: "/items" });
    },
  },
};
</script>
