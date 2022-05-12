<template>
  <b-card>
    <b-card-title>Edit Item</b-card-title>
    <b-card-body>
      <b-form @submit="onSubmit">
        <form-input
          v-model="form.title"
          label="Title"
          field="title"
          required
        />
        <form-input
          label="Quantity"
          field="quantity"
          v-model="form.quantity"
          type="number"
        />

        <form-input
          field="description"
          label="Description"
          v-model="form.description"
        />
        <form-input
          field="price"
          label="Price"
          v-model="form.price"
        />
        <form-input
          field="cost"
          label="Acquisition Cost"
          v-model="form.cost"
        />

        <b-form-group
          id="listingUser-input-group"
          label="Listing User"
          label-for="listingUser-input"
        >
          <b-form-select
            id="listingUser-input"
            v-model="form.listingUserId"
            :options="this.users"
          ></b-form-select>
        </b-form-group>

        <b-form-group
          id="owner-input-group"
          label="Owner"
          label-for="owner-input"
        >
          <b-form-select
            id="owner-input"
            v-model="form.ownerId"
            :options="this.owners"
          ></b-form-select>
        </b-form-group>

        <form-input
          field="acquisitionDate"
          label="Aquisition Date"
          v-model="form.acquisitionDate"
          type="date"
        />

        <form-input
          field="weightPounds"
          label="Weight (Lbs.)"
          v-model="form.weightPounds"
          type="number"
        />
        <form-input
          field="weightOunces"
          label="Weight (Oz.)"
          v-model="form.weightOunces"
          type="number"
        />

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

        <form-input
          field="sizeWidthInches"
          label="Width (In.)"
          v-model="form.sizeWidthInches"
          type="number"
        />
        <form-input
          field="sizeHeightInches"
          label="Height (In.)"
          v-model="form.sizeHeightInches"
          type="number"
        />
        <form-input
          field="sizeDepthInches"
          label="Depth (In.)"
          v-model="form.sizeDepthInches"
          type="number"
        />

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

        <div
          v-for="(image, index) in this.form
            .images"
          :key="index"
        >
          <img :src="image" />
        </div>

        <input
          type="file"
          accept="image/*"
          multiple="true"
          v-on:change="addImages"
        />

        <b-button type="submit" variant="primary"
          >Update</b-button
        >
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import FormInput from "@/components/FormInput";
import api from "@/api";

export default {
  data() {
    return {
      camera: false,
      users: [],
      owners: [],
      form: {
        title: "",
        quantity: 1,
        price: 0.0,
        cost: 0.0,
        acquisitionDate: "",
        listingUserId: this.$cookie.get("userId"),
        ownerId: "",
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
      },
    };
  },
  components: {
    FormInput,
  },
  async created() {
    const token = this.$cookie.get("token");
    const users = await api.getUsers(token);

    this.users = users.map((user) => ({
      value: user.id,
      text: user.name,
    }));

    const owners = await api.getOwners(token);
    this.owners = owners.map((owner) => ({
      value: owner.id,
      text: owner.name,
    }));

    const itemId = this.$route.params.id;
    const url =
      process.env.VUE_APP_API_BASE_URL +
      "/api/v1/items/" +
      itemId;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    this.form = await response.json();
  },
  methods: {
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

    async onSubmit(event) {
      event.preventDefault();

      this.payload = JSON.parse(
        JSON.stringify(this.form),
      );

      this.payload.quantity = parseInt(
        this.payload.quantity,
      );
      this.payload.weightPounds = parseInt(
        this.payload.weightPounds,
      );
      this.payload.weightOunces = parseInt(
        this.payload.weightOunces,
      );
      this.payload.shipWeightPounds = parseInt(
        this.payload.shipWeightPounds,
      );
      this.payload.shipWeightOunces = parseInt(
        this.payload.shipWeightOunces,
      );
      this.payload.sizeWidthInches = parseInt(
        this.payload.sizeWidthInches,
      );
      this.payload.sizeHeightInches = parseInt(
        this.payload.sizeHeightInches,
      );
      this.payload.sizeDepthInches = parseInt(
        this.payload.sizeDepthInches,
      );
      this.payload.shipSizeWidthInches = parseInt(
        this.payload.shipSizeWidthInches,
      );
      this.payload.shipSizeHeightInches =
        parseInt(
          this.payload.shipSizeHeightInches,
        );
      this.payload.shipSizeDepthInches = parseInt(
        this.payload.shipSizeDepthInches,
      );

      this.payload.cost = parseFloat(
        this.payload.cost,
      ).toFixed(2);
      this.payload.price = parseFloat(
        this.payload.price,
      ).toFixed(2);

      if (this.payload.acquisitionDate == "") {
        delete this.payload.acquisitionDate;
      } else {
        this.payload.acquisitionDate = new Date(
          this.payload.acquisitionDate,
        ).toISOString();
      }

      const itemId = this.$route.params.id;
      const url =
        process.env.VUE_APP_API_BASE_URL +
        "/api/v1/items/" +
        itemId;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify(this.payload),
      });
      await response.json();
      this.$router.push({
        path: "/viewItem/" + itemId,
      });
    },
  },
};
</script>
