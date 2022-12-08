<template>
  <b-card>
    <b-card-title>Add Item</b-card-title>
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

        <b-container fluid class="p-0">
          <b-row class="m-0 p-0">
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <SelectInput
                label="Condition"
                v-model="form.ebayConditionId"
                :options="conditions"
                @input="changeSpecifics"
              />
            </b-col>
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <TextInput label="Quantity" v-model="form.quantity" />
            </b-col>
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <TextInput label="Price" v-model="form.price" />
            </b-col>
            <b-col xs="3" class="m-0 p-0">
              <SelectInput label="Acquisition" v-model="form.acquisitionId" :options="acquisitions" />
            </b-col>
          </b-row>
        </b-container>

        <SpecificInput v-model="form.specifics" @input="changeSpecifics" />
        <TextInput
          label="Title"
          v-model="form.title"
          :required="true"
          :maxLength="75"
          :minLength="50"
          :checkState="true"
        />
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
                <b-row class="m-0">
                  <b-col class="m-0 p-0">
                    <TextInput label="Location" v-model="form.location" />
                  </b-col>
                </b-row>
              </b-container>
            </b-col>
          </b-row>
        </b-container>

        <b-row class="m-0 p-0">
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

        <b-button type="submit" variant="primary" style="margin-top: 10px">Add</b-button>
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import EbayCategoryChooser from "@/components/EbayCategoryChooser";
import SpecificInput from "@/components/SpecificInput";
import ShippingInput from "@/components/ShippingInput";
import TextInput from "@/components/TextInput";
import SelectInput from "@/components/SelectInput";

import ImageView from "@/components/ImageView";
import CameraInput from "@/components/CameraInput";
import api from "@/api";
import util from "@/util";

export default {
  components: {
    EbayCategoryChooser,
    SpecificInput,
    ShippingInput,
    ImageView,
    CameraInput,
    TextInput,
    SelectInput,
  },
  data() {
    return {
      users: [],
      owners: [],
      templates: [],
      template: undefined,
      templateOptions: [],
      conditions: [],
      acquisitions: [],
      form: {
        title: "",
        quantity: 1,
        price: 0.0,
        description: "",
        ebayListingId: "",
        currentPrice: 0.0,
        quantitySold: 0,
        listingUserId: this.$cookie.get("userId"),
        ebayCategoryId: 0,
        ebayConditionId: 0,
        location: "",
        ownerId: "",
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
    const token = this.$cookie.get("token");
    this.token = this.$cookie.get("token");
    this.templates = await api.getTemplates(token);
    this.templateOptions = await util.getTemplateOptions(token);
    this.users = await util.getUserOptions(token);
    this.owners = await util.getOwnerOptions(token);
    this.acquisitions = await util.getAcquisitionOptions(token);
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
        this.form.location = this.template.location || "";
        this.changeSpecifics();
      }
    },
    async lookupProduct(upc) {
      if (upc.toString().length == 12) {
        const result = await api.lookupProduct(this.token, upc.toString());
        if (Object.keys(result).length > 0) {
          //this.form.specifics = [];
          Object.keys(result).forEach((key) => {
            let found = false;
            for (let i = 0; i < this.form.specifics.length; i++) {
              if (this.form.specifics[i].key === key) {
                this.form.specifics[i].value = String(result[key]).substring(0, 50);
                found = true;
              }
            }
            if (!found) {
              this.form.specifics.push({ key: key, value: String(result[key]).substring(0, 50) });
            }
          });
          this.changeSpecifics();
        } else {
          this.$toast.error("Unable to find item with UPC " + upc);
          this.form.upc = "";
        }
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

      this.payload.price = parseFloat(this.payload.price).toFixed(2);

      if (!this.payload.currentPrice) {
        this.payload.currentPrice = this.payload.price;
      }

      if (!this.payload.ownerId) {
        this.payload.ownerId = "0";
      }

      this.payload.specifics = JSON.stringify(this.payload.specifics);
      try {
        await api.createItem(this.token, this.payload);
        this.$toast.success("Add Item Successful");
        this.$router.push({ path: "/items" });
      } catch (err) {
        this.$toast.error("Add Item Unsuccessful!<br />Reasons:<br />" + err.response.data.ShortMessage, { duration: 0 });
        console.error(err);
      }
    },
  },
};
</script>
