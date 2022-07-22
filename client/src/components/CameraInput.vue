<template>
  <div class="section">
    <h1>Camera</h1>
    <div style="text-align: center; width: 100%">
      <div class="camera-frame">
        <video v-show="cameraEnabled" id="camera" ref="camera" class="camera camera-offset" autoplay />
        <b-img v-if="!cameraEnabled" blank blank-color="black" class="camera" />
        <b-button v-show="cameraEnabled" @click="takePhoto" variant="info" class="camera-shutter">
          <b-icon-camera-fill />
        </b-button>
        <b-button @click="toggleCamera" variant="info" class="camera-toggle">
          <b-icon-camera-video-off-fill v-if="cameraEnabled" />
          <b-icon-camera-video-fill v-else />
        </b-button>
      </div>
    </div>
    <b-container style="margin-top: 5px; text-align: center">
      <b-row>
        <b-col xs="4" style="text-align: center">
          <b>Crop:</b>
          <b-form-radio-group v-model="cropFactor" :options="cropOptions" value-field="item" text-field="name" />
        </b-col>
        <b-col xs="4" style="text-align: center"> <b>Rotate 180:</b> <b-form-checkbox v-model="rotate180" /> </b-col>
        <b-col xs="4" style="text-align: center"
          ><b> Boost Brightness:</b> <b-form-checkbox v-model="brightnessBoost" />
        </b-col>
      </b-row>
      <label for="file-upload" class="file-upload" style="margin-top: 10px">
        <b-icon-cloud-upload-fill />
        Upload Images
      </label>
      <input id="file-upload" type="file" accept="image/*" multiple="true" v-on:change="addImages" />
    </b-container>
  </div>
</template>
<script>
import itemUtils from "@/components/Item/itemUtils";
export default {
  data() {
    return {
      cameraEnabled: false,
      cropFactor: "1.333",
      cropOptions: [
        { item: "0", name: "None" },
        { item: "1.333", name: "4:3" },
        { item: "1", name: "Square" },
      ],
      rotate180: false,
      brightnessBoost: false,
    };
  },
  methods: {
    toggleCamera() {
      if (this.cameraEnabled) {
        this.stopCameraStream();
        this.cameraEnabled = false;
      } else {
        this.createCameraElement();
      }
    },
    async createCameraElement() {
      const widths = [3840, 1920, 1280, 640];

      for (const width of widths) {
        const constraints = {
          video: {
            mandatory: {
              minWidth: width,
            },
          },
        };

        try {
          this.$refs.camera.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
          this.cameraEnabled = true;
          break;
        } catch (e) {
          if (width == 640) {
            console.error("Cannot get stream: " + e);
          }
        }
      }
      window.addEventListener("keydown", this.shortcutListener);
    },
    shortcutListener(event) {
      if (event.key === "`") {
        this.takePhoto();
      }
    },
    stopCameraStream() {
      const tracks = this.$refs.camera.srcObject.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      window.removeEventListener("keydown", this.shortcutListener);
    },

    takePhoto() {
      let canvas = document.createElement("canvas");
      const camera = document.getElementById("camera");
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      const context = canvas.getContext("2d");
      if (this.brightnessBoost) {
        context.filter = "brightness(150%)";
      }
      context.drawImage(this.$refs.camera, 0, 0, canvas.width, canvas.height);

      if (this.cropFactor !== "0") {
        canvas = this.cropImage(canvas, parseFloat(this.cropFactor));
      }
      if (this.rotate180) {
        canvas = this.rotateImage180(canvas);
      }
      canvas = this.resizeImage(canvas);

      this.$emit("photoTaken", canvas.toDataURL("image/jpeg", 0.7));
    },
    cropImage(image, ratio = 1.3333) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.height * ratio);
      canvas.height = image.height;
      const left = (image.width - canvas.width) / 2;
      const context = canvas.getContext("2d");
      context.drawImage(image, left, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      return canvas;
    },
    rotateImage180(image) {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(Math.PI);
      context.drawImage(image, -image.width / 2, -image.height / 2);
      return canvas;
    },
    resizeImage(image) {
      const maxSideSize = 1600;

      if (image.width <= maxSideSize && image.height <= maxSideSize) {
        return image;
      }

      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      if (image.width > image.height) {
        if (image.width > maxSideSize) {
          canvas.height *= maxSideSize / image.width;
          canvas.width = maxSideSize;
        }
      } else {
        if (image.height > maxSideSize) {
          canvas.width *= maxSideSize / image.height;
          canvas.height = maxSideSize;
        }
      }
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    },
    async addImages(event) {
      event.preventDefault();
      const files = [...event.target.files];
      files.forEach(async (file) => {
        const image = await itemUtils.resizeImage(file);
        this.$emit("photoTaken", image);
      });
    },
  },
};
</script>
<style scoped>
.frame {
  background: #ccc;
  border: 1px solid black;
  margin: 0px;
  padding: 10px;
  max-width: 520px;
}

.camera {
  width: 500px;
  height: 500px;
  z-index: 0;
  background-color: black;
  border: 1px solid black;
  text-align: center;
}

.camera-offset {
  height: 495px;
}

.camera-toggle {
  z-index: 1;
  position: absolute;
  top: 10px;
  left: 10px;
}

.camera-shutter {
  position: absolute;
  z-index: 1;
  bottom: 50px;
  left: 225px;
}

.camera-frame {
  text-align: center;
  padding: 0;
  margin: 0;
  max-width: 500px;
  display: inline-block;
  position: relative;
}
</style>
