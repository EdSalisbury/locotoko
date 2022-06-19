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
        <form-input field="cost" label="Acquisition Cost" v-model="form.cost" />

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

        <div v-for="(image, index) in this.form.images" :key="index">
          <img :src="image" width="100" height="100" />
        </div>

        <!-- <photo-camera
          v-if="this.camera"
          @photoTaken="photoTaken"
        /> -->

        <input type="file" accept="image/*" multiple="true" v-on:change="addImages" />

        <!-- <button
          v-show="!this.camera"
          @click="addImage"
        >
          Add Photo
        </button> -->

        <b-button type="submit" variant="primary">Add</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import FormInput from "@/components/FormInput";
import EbayCategoryChooser from "@/components/EbayCategoryChooser";

//import PhotoCamera from "@/components/PhotoCamera";
import api from "@/api";
import util from "@/util";

export default {
  data() {
    return {
      camera: false,
      users: [],
      owners: [],
      templates: [],
      template: undefined,
      templateOptions: [],
      specifics: [],
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
    //PhotoCamera,
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
    addImages(event) {
      event.preventDefault();
      const files = [...event.target.files];
      files.forEach((file) => {
        this.createBase64Image(file);
      });
    },
    createBase64Image(fileObject) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = e.target.result;
        this.form.images.push(img);
      };
      reader.readAsDataURL(fileObject);
    },
    addImage(event) {
      event.preventDefault();
      this.camera = true;
    },
    changeSpecifics() {
      let title = this.template.title;
      let description = this.template.description;

      this.specifics.forEach((name) => {
        title = title.replaceAll("${" + name + "}", this.form.specifics[name] || "");
        description = description.replaceAll("${" + name + "}", this.form.specifics[name] || "");
      });
      this.form.title = title;
      this.form.description = description;

      // console.log(this.template.conditions);
      // const conditions = JSON.parse(this.template.conditions);
      // console.log(conditions);
      // const conditionName = conditions.filter((cond) => cond.ID === this.form.ebayConditionId).DisplayName;
      // console.log(conditionName);
      // this.form.title.replaceAll("${Condition}", conditionName);
    },
    changeTemplate(event) {
      if (event === "0") {
        this.template = 0;
        this.form.ebayCategoryId = 0;
        this.conditions = [];
        this.specifics = [];
        this.form.specifics = [];
      } else {
        this.template = this.templates.find((template) => template.id === event);
        this.form.ebayCategoryId = this.template.ebayCategoryId || 0;
        this.specifics = JSON.parse(this.template.specifics) || "";
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
        this.changeSpecifics();
      }
    },
    photoTaken(value) {
      this.form.images.push(value);
      this.camera = false;
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
