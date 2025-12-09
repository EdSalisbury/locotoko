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
        <b-container fluid class="section">
          <b-row>
            <b-col cols="11">
              <h1>Prompt</h1>
              <b-form-textarea v-model="form.prompt" rows="2" max-rows="10" />
            </b-col>
            <b-col>
              <b-button @click="generatePrompt" variant="primary" style="margin-top: 10px">Generate</b-button>
            </b-col>
          </b-row>
        </b-container>
        <TextInput
          label="Title"
          v-model="form.title"
          :max-size="75"
          :required="true"
          :maxLength="75"
          :minLength="50"
          :checkState="true"
        />

        <b-container fluid class="p-0" style="margin-top: 10px">
          <b-row class="m-0 p-0">
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <TextInput label="Quantity" v-model="form.quantity" />
            </b-col>
            <b-col xs="3" class="m-0 pl-0 pr-0">
              <TextInput label="Sold Quantity" v-model="form.quantitySold" />
            </b-col>
            <b-col xs="3" class="m-0 p-0">
              <DateInput label="Sold At" v-model="form.soldAt" />
            </b-col>
          </b-row>
        </b-container>
        <b-container fluid class="p-0" style="margin-top: 10px">
          <b-row class="m-0 p-0">
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <TextInput label="Price" v-model="form.price" />
            </b-col>
            <b-col xs="3" class="m-0 p-0">
              <DateInput label="Ended At" v-model="form.endedAt" />
            </b-col>
          </b-row>
        </b-container>
        <b-container fluid class="p-0" style="margin-top: 10px">
          <b-row class="m-0 p-0">
            <b-col xs="3" class="m-0 pl-0 pr-2">
              <TextInput label="Location" v-model="form.location" />
            </b-col>
            <b-col xs="3" class="m-0 pl-0 pr-0">
              <TextInput label="eBay Listing ID" v-model="form.ebayListingId"
            /></b-col>
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
          <b-row>
            <b-col
              ><SelectInput
                label="Shipping Type"
                v-model="form.shippingType"
                :options="this.shippingTypeOptions"
                @input="this.changeShippingType"
              />
            </b-col>
            <b-col><TextInput label="Shipping Price" v-model="form.shippingPrice" :disabled="true" /></b-col>
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
import DateInput from "@/components/DateInput";

import api from "@/api";
import util from "@/util";
import axios from "axios";

export default {
  components: {
    EbayCategoryChooser,
    SpecificInput,
    ShippingInput,
    ImageView,
    CameraInput,
    SelectInput,
    TextInput,
    DateInput,
  },
  data() {
    return {
      camera: false,
      users: [],
      owners: [],
      shippingDiscount: 0.8,
      imageSortKeys: [],
      template: undefined,
      templates: [],
      templateOptions: [],
      shippingTypeOptions: [],
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
        shippingCost: 0.0,
        shippingType: 0,
        soldAt: "",
        endedAt: "",
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
        prompt: "",
      },
    };
  },

  async created() {
    const itemId = this.$route.params.id;
    const token = this.$cookie.get("token");
    this.token = token;
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    this.templates = await api.getTemplates(token);
    this.templateOptions = await util.getTemplateOptions(token);
    this.shippingTypeOptions = util.getShippingTypeOptions();
    this.users = await util.getUserOptions(token);
    this.owners = await util.getOwnerOptions(token);
    this.acquisitions = await util.getAcquisitionOptions(token);

    this.template = this.templates.filter((template) => template.id === this.form.templateId)[0];

    this.form = await api.getItem(token, itemId);
    // Remove the ID from the title
    this.form.title = this.form.title.slice(0, -5);
    this.form.oldTemplateId = this.form.templateId;
    // Handle no template issue more gracefully
    if (this.form.templateId === "0") {
      this.form.templateId = "";
    }

    const newImages = [];
    this.form.images.forEach(async (file) => {
      const newFile = util.dataURLtoFile(file, "filename.jpg");
      newImages.push(await itemUtils.resizeImage(newFile));
    });
    this.$set(this.form.images, newImages);
    this.imageSortKeys = this.form.images.map((_, index) => this.generateSequentialKey(index));
  },
  watch: {
    "form.weight": {
      handler() {
        this.updateCalculatedShipping();
      },
      deep: true,
    },
    "form.size": {
      handler() {
        this.updateCalculatedShipping();
      },
      deep: true,
    },
  },
  methods: {
async generatePrompt() {
      try {
        const enrichedPrompt = await this.enrichPromptWithScryfall(this.form.prompt);
        const payload = {
          prompt: enrichedPrompt,
        };

          // 🔥 Ensure specifics is an array of { key, value }
        payload.specifics = this.form.specifics.map(specific => ({
          key: specific.key,
          value: specific.value,
        }));

        // Call the API (modify endpoint accordingly)
        const response = await api.generateListing(this.token, payload);

        // Update form values with the response
        if (response) {
          this.form.title = response.title || this.form.title;
          this.form.description = response.description || this.form.description;
          this.form.specifics = response.specifics || this.form.specifics;
        }

        this.$toast.success("Generated listing successfully!");
      } catch (error) {
        this.$toast.error("Failed to generate listing: " + (error.response?.data?.message || error.message));
        console.error(error);
      }
    },
    async changeCategory(event) {
      this.conditions = await util.getEbayConditionOptions(this.$cookie.get("token"), event);
      const oldSpecifics = this.form.specifics;
      const newSpecifics = await util.getEbaySpecifics(this.$cookie.get("token"), event);
      const combined = [...oldSpecifics, ...newSpecifics];
      const merged = combined.reduce((acc, obj) => {
        acc[obj["key"]] = { ...acc[obj["key"]], ...obj};
        return acc;
      }, {});

      this.form.specifics = [...Object.values(merged)].sort((a, b) => {
        const aRequired = a.required ? 1 : 0;
        const bRequired = b.required ? 1 : 0;
        return bRequired - aRequired;  // Sort in descending order of required
      });
  },
    changeShippingType(event) {
      if (parseInt(event) === 1) {
        this.form.shippingPrice = 1;
      } else if (parseInt(event) == 2) {
        this.form.shippingPrice = 5;
      } else if (parseInt(event) == 3) {
        this.form.shippingPrice = 8;
      } else if (parseInt(event) == 4) {
        this.form.shippingPrice = 14;
      } else if (parseInt(event) == 5) {
        this.form.shippingPrice = 19;
      } else if (parseInt(event) === 99) {
        this.updateCalculatedShipping();
      }
    },
    updateCalculatedShipping() {
      if (parseInt(this.form.shippingType) !== 99) {
        return;
      }
      const pounds = parseInt(this.form.weight.pounds) || 0;
      const length = parseInt(this.form.size.length) || 0;
      const width = parseInt(this.form.size.width) || 0;
      const height = parseInt(this.form.size.height) || 0;

      const dimensionalWeight = Math.ceil((length * width * height) / 166) || 0;
      const billableWeight = Math.max(1, Math.max(pounds, dimensionalWeight));
      const baseRate = 5;
      const perPoundRate = 2;
      const rawPrice = baseRate + perPoundRate * billableWeight;
      const discounted = rawPrice * this.shippingDiscount;
      this.form.shippingPrice = Number(Math.max(discounted, 4).toFixed(2));
    },
    deleteImage(index) {
      this.form.images.splice(index, 1);
      this.imageSortKeys.splice(index, 1);
    },
    moveImageLeft(index) {
      if (index === 0) {
        return;
      }
      this.swapImages(index, index - 1);
    },
    moveImageRight(index) {
      if (index >= this.form.images.length - 1) {
        return;
      }
      this.swapImages(index, index + 1);
    },
    swapImages(a, b) {
      const tmp = this.form.images[a];
      this.$set(this.form.images, a, this.form.images[b]);
      this.$set(this.form.images, b, tmp);
      const tmpKey = this.imageSortKeys[a];
      this.$set(this.imageSortKeys, a, this.imageSortKeys[b]);
      this.$set(this.imageSortKeys, b, tmpKey);
    },
    async addImages(event) {
      event.preventDefault();
      let files = [...event.target.files];
      files.sort((a, b) => a.name.localeCompare(b.name));
      for (const file of files) {
        const resized = await itemUtils.resizeImage(file);
        this.photoTaken({ data: resized, name: file.name });
      }
    },
    normalizeImagePayload(payload) {
      if (typeof payload === "string") {
        return {
          data: payload,
          sortKey: `camera-${Date.now()}`,
        };
      }
      return {
        data: payload.data,
        sortKey: payload.name || `camera-${Date.now()}`,
      };
    },
    generateSequentialKey(index) {
      return index.toString().padStart(6, "0");
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
            this.form.specifics.push({ key: key, value: String(result[key]).substring(0, 50) });
          });
          this.changeSpecifics();
        } else {
          this.$toast.error("Unable to find item with UPC " + upc);
          this.form.upc = "";
        }
      }
    },
    async enrichPromptWithScryfall(prompt) {
      if (!prompt) {
        return prompt;
      }

      const match = prompt.match(/^MTG\s*-\s*(.*?)\s*-\s*(.*?)/i);
      if (!match) {
        return prompt;
      }

      const cardName = match[1].trim();
      const setName = match[2].trim();

      try {
        const response = await axios.get(
          `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`,
        );
        const card = response.data;

        if (setName && card.set_name && !card.set_name.toLowerCase().includes(setName.toLowerCase())) {
          console.warn(`Set name mismatch: expected ${setName}, got ${card.set_name}`);
          return prompt;
        }

        return `${prompt}\n\nScryfall results:\n${JSON.stringify(card, null, 2)}`;
      } catch (err) {
        console.warn("Failed to fetch from Scryfall:", err.message || err);
        return prompt;
      }
    },
    photoTaken(payload) {
      const { data, sortKey } = this.normalizeImagePayload(payload);
      const insertIndex = this.imageSortKeys.findIndex((key) => key.localeCompare(sortKey) > 0);
      if (insertIndex === -1) {
        this.imageSortKeys.push(sortKey);
        this.form.images.push(data);
      } else {
        this.imageSortKeys.splice(insertIndex, 0, sortKey);
        this.form.images.splice(insertIndex, 0, data);
      }
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
      this.payload.quantitySold = parseInt(this.payload.quantitySold);

      if (this.payload.soldAt) {
        try {
          const date = new Date(this.payload.soldAt);
          this.payload.soldAt = date.toISOString();
        } catch {
          this.payload.soldAt = null;
        }
      } else {
        this.payload.soldAt = null;
      }

      if (this.payload.endedAt) {
        try {
          const date = new Date(this.payload.endedAt);
          this.payload.endedAt = date.toISOString();
        } catch {
          this.payload.endedAt = null;
        }
      } else {
        this.payload.endedAt = null;
      }

      this.payload.shipWeightPounds = parseInt(this.payload.weight.pounds);
      this.payload.shipWeightOunces = parseInt(this.payload.weight.ounces);

      this.payload.shipSizeWidthInches = parseInt(this.payload.size.width);
      this.payload.shipSizeHeightInches = parseInt(this.payload.size.height);
      this.payload.shipSizeDepthInches = parseInt(this.payload.size.length);

      this.payload.price = Number(this.payload.price).toFixed(2);
      this.payload.shippingType = parseInt(this.payload.shippingType);
      this.payload.shippingPrice = Number(this.payload.shippingPrice).toFixed(2);

      const token = this.$cookie.get("token");

      const itemId = this.$route.params.id.toString();

      this.payload.specifics = JSON.stringify(this.payload.specifics);

      try {
        await api.updateItem(this.token, itemId, this.payload);
        this.$toast.success("Edit Item Successful");
        this.$router.push({ path: "/items" });
      } catch (err) {
        this.$toast.error("Edit Item Unsuccessful!</br>Reasons:</br>" + err.response, {
          duration: 0,
        });
        console.error(err);
      }

      if (this.form.ebayListingId) {
        try {
          const response = await api.updateEbayListing(token, itemId, {
            itemId: itemId,
          });
          console.log(response);
          this.$toast.success("Edit eBay Listing Successful");
          this.$router.push({ path: "/items" });
        } catch (err) {
          let messages = [];

          if (!err.response.data.message) {
            messages = [err.response.data.ShortMessage];
          } else {
            messages = err.response.data.message.map((msg) => {
              return msg.ShortMessage;
            });
          }

          const msgList = "<ul><li>" + messages.join("</li><li>") + "</ul></li>";

          this.$toast.error("Edit eBay Listing Unsuccessful!</br>Reasons:</br>" + msgList, {
            duration: 0,
          });
          console.error(err);
        }
      }
    },
  },
};
</script>
