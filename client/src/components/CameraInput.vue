<template>
  <div class="frame">
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
      Cropping: <b-form-radio-group v-model="cropFactor" :options="cropOptions" value-field="item" text-field="name" />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cameraEnabled: false,
      cropFactor: "0",
      cropOptions: [
        { item: "0", name: "None" },
        { item: "1.333", name: "4:3" },
        { item: "1", name: "Square" },
      ],
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
        } catch {
          // Do nothing
        }
      }
    },

    stopCameraStream() {
      const tracks = this.$refs.camera.srcObject.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    },

    takePhoto() {
      let canvas = document.createElement("canvas");
      const camera = document.getElementById("camera");
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      canvas.getContext("2d").drawImage(this.$refs.camera, 0, 0, canvas.width, canvas.height);

      if (this.cropFactor !== "0") {
        canvas = this.cropImage(canvas, parseFloat(this.cropFactor));
      }

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
}

.camera-offset {
  height: 495px;
}

.camera-toggle {
  position: absolute;
  z-index: 1;
  bottom: 540px;
  left: 60px;
}

.camera-shutter {
  position: absolute;
  z-index: 1;
  bottom: 110px;
  left: 280px;
}

.camera-frame {
  text-align: center;
  padding: 0;
  margin: 0;
  max-width: 500px;
}
</style>
