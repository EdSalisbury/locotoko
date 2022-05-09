<template>
  <b-card>
    <b-card-title>Add Item</b-card-title>
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

        <ul>
          <photo-camera
            v-for="(photo, index) in form.photos"
            :key="`photo-${index}`"
          />

          <button @click="addPhoto">
            Add Photo
          </button>
        </ul>

        <b-button type="submit" variant="primary"
          >Add</b-button
        >
      </b-form>
    </b-card-body>
  </b-card>
</template>

<script>
import FormInput from "@/components/FormInput";
import PhotoCamera from "@/components/PhotoCamera";

export default {
  data() {
    return {
      form: {
        title: "",
        quantity: 1,
        price: 0.0,
        cost: 0.0,
        acquisitionDate: "",
        listingUserId: "",
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
        photos: ["test.jpg"],
      },
    };
  },
  components: {
    FormInput,
    PhotoCamera,
  },
  methods: {
    addPhoto() {
      this.form.photos.push();
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

      const url = "http://localhost:3333/items";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + this.$cookie.get("token"),
        },
        body: JSON.stringify(this.payload),
      });
      await response.json();
      this.$router.push({ path: "/items" });
    },
  },
};
</script>

<style scoped>
body {
  display: flex;
  justify-content: center;
}

.web-camera-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 500px;
}
.camera-button {
  margin-bottom: 2rem;
}
/* 
  .camera-box {
    .camera-shutter {
      opacity: 0;
      width: 450px;
      height: 337.5px;
      background-color: #fff;
      position: absolute;

      &.flash {
        opacity: 1;
      }
    }
  }

  .camera-shoot {
    margin: 1rem 0;

    button {
      height: 60px;
      width: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100%;

      img {
        height: 35px;
        object-fit: cover;
      }
    }
  }

  .camera-loading {
    overflow: hidden;
    height: 100%;
    position: absolute;
    width: 100%;
    min-height: 150px;
    margin: 3rem 0 0 -1.2rem;

    ul {
      height: 100%;
      position: absolute;
      width: 100%;
      z-index: 999999;
      margin: 0;
    }

    .loader-circle {
      display: block;
      height: 14px;
      margin: 0 auto;
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      transform: translateX(-50%);
      position: absolute;
      width: 100%;
      padding: 0;

      li {
        display: block;
        float: left;
        width: 10px;
        height: 10px;
        line-height: 10px;
        padding: 0;
        position: relative;
        margin: 0 0 0 4px;
        background: #999;
        animation: preload 1s infinite;
        top: -50%;
        border-radius: 100%;

        &:nth-child(2) {
          animation-delay: 0.2s;
        }

        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }

  @keyframes preload {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
} */
</style>
