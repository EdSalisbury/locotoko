<template>
  <b-card>
    <b-card-title>Edit Item</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col xs="6" class="m-0 pl-0 pr-2">
              <SelectInput
                label="Template"
                v-model="form.templateId"
                :options="templateOptions"
                @input="changeTemplate"
              />
            </b-col>
            <b-col xs="6" class="m-0 p-0">
              <TextInput label="UPC" v-model="form.upc" @input="lookupProduct" v-on:keydown.enter.native.prevent />
            </b-col>
          </b-row>
        </b-container>
        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 pt-2">
            <b-col xs="6" class="m-0 pl-0 pr-2">
              <SelectInput label="Listing User" v-model="form.listingUserId" :options="this.users" />
            </b-col>
            <b-col xs="6" class="m-0 pl-0 pr-0">
              <SelectInput label="Item Owner" v-model="form.ownerId" :options="this.owners" :required="true" />
            </b-col>
          </b-row>
        </b-container>

        <EbayCategoryChooser v-model="form.ebayCategoryId" :key="form.ebayCategoryId" @input="changeCategory" />
        <SpecificInput v-model="form.specifics" @input="changeSpecifics" />
        <TextInput label="Title" v-model="form.title" :max-size="75" :required="true" />

        <b-container fluid class="p-0" style="margin-top: 10px">
          <b-row class="m-0 p-0">
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <TextInput label="Quantity" v-model="form.quantity" />
            </b-col>
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <TextInput label="Sale Price" v-model="form.price" />
            </b-col>
            <b-col xs="3" class="m-0 pl-0 pr-0">
              <TextInput label="Location" v-model="form.location" />
            </b-col>
          </b-row>
        </b-container>

        <b-container fluid class="section">
          <h1>Description</h1>
          <b-form-textarea v-model="form.description" rows="5" max-rows="10" />
        </b-container>

        <b-container fluid class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col xs="6" class="m-0 pl-0 pr-2">
              <ShippingInput :weight="form.weight" :size="form.size" />
            </b-col>
            <b-col xs="6" class="m-0 p-0">
              <b-container fluid class="m-0 p-0">
                <b-row class="m-0 p-0">
                  <b-col class="m-0 p-0">
                    <SelectInput
                      label="Condition"
                      v-model="form.ebayConditionId"
                      :options="conditions"
                      @input="changeSpecifics"
                    />
                  </b-col>
                </b-row>
                <b-row class="m-0 pt-2">
                  <b-col class="m-0 p-0">
                    <SelectInput label="Acquisition" v-model="form.acquisitionId" :options="acquisitions" />
                  </b-col>
                </b-row>
              </b-container>
            </b-col>
          </b-row>
        </b-container>

        <b-row fluid class="m-0 p-0">
          <b-col xs="5" class="m-0 pl-0 pr-2">
            <CameraInput @photoTaken="photoTaken" />
          </b-col>
          <b-col xs="auto" class="m-0 pl-0 pr-0">
            <ImageView
              :images="form.images"
              @deleteImage="deleteImage"
              :edit="true"
              @moveImageLeft="moveImageLeft"
              @moveImageRight="moveImageRight"
            />
          </b-col>
        </b-row>

        <b-button type="submit" variant="primary" style="margin-top: 10px">Update</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import EbayCategoryChooser from "@/components/EbayCategoryChooser";
import SpecificInput from "@/components/SpecificInput";
import ShippingInput from "@/components/ShippingInput";
import itemUtils from "./itemUtils";
import ImageView from "@/components/ImageView";
import CameraInput from "@/components/CameraInput";
import TextInput from "@/components/TextInput";
import SelectInput from "@/components/SelectInput";

import api from "@/api";
import util from "@/util";

export default {
  components: {
    EbayCategoryChooser,
    SpecificInput,
    ShippingInput,
    ImageView,
    CameraInput,
    SelectInput,
    TextInput,
  },
  data() {
    return {
      camera: false,
      users: [],
      owners: [],
      template: undefined,
      templates: [],
      templateOptions: [],
      conditions: [],
      acquisitions: [],
      form: {
        title: "",
        quantity: 1,
        price: 0.0,
        location: "",
        listingUserId: this.$cookie.get("userId"),
        ebayCategoryId: 0,
        ebayConditionId: 0,
        ownerId: "",
        oldTemplateId: "",
        templateId: "",
        acquisitionId: "",
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

  async created() {
    const itemId = this.$route.params.id;
    const token = this.$cookie.get("token");
    this.token = token;

    this.templates = await api.getTemplates(token);
    this.templateOptions = await util.getTemplateOptions(token);
    this.users = await util.getUserOptions(token);
    this.owners = await util.getOwnerOptions(token);
    this.acquisitions = await util.getAcquisitionOptions(token);

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
    this.$set(this.form.images, newImages);
  },
  methods: {
    async changeCategory(event) {
      this.conditions = await util.getEbayConditionOptions(this.$cookie.get("token"), event);
    },
    deleteImage(index) {
      this.form.images.splice(index, 1);
    },
    moveImageLeft(index) {
      const tmp = this.form.images[index - 1];
      this.$set(this.form.images, index - 1, this.form.images[index]);
      this.$set(this.form.images, index, tmp);
    },
    moveImageRight(index) {
      const tmp = this.form.images[index + 1];
      this.$set(this.form.images, index + 1, this.form.images[index]);
      this.$set(this.form.images, index, tmp);
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
    async lookupProduct(upc) {
      if (upc.toString().length == 12) {
        const result = await api.lookupProduct(this.token, upc.toString());
        if (Object.keys(result).length > 0) {
          console.log(result);
          this.form.specifics = [];
          Object.keys(result).forEach((key) => {
            this.form.specifics.push({ key: key, value: result[key] });
          });
          this.changeSpecifics();
        } else {
          this.$toast.error("Unable to find item with UPC " + upc);
          this.form.upc = "";
        }
      }
    },
    async photoTaken(value) {
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
        this.form.location = this.template.location || "";
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

      this.payload.price = parseFloat(this.payload.price).toFixed(2);

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
        const response = await api.updateEbayListing(token, itemId, {
          itemId: itemId,
        });

        if (response.status == 200) {
          this.$toast.success("Update Listing Successful");
        } else {
          const err = await response.json();
          const msgs = err.message.map((msg) => "<li>" + msg.ShortMessage + "</li>");

          let msg = "<ul>" + msgs.join("") + "</ul>";
          this.$toast.error("Update Listing Unsuccessful!</br>Reasons:</br>" + msg, { duration: 0 });
          console.error(err);
        }
      }

      this.$router.push({ path: "/items" });
    },
  },
};
</script>
