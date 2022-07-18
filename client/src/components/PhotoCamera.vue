<template>
  <div id="app" class="web-camera-container">
    <div v-show="isLoading" class="camera-loading">
      <ul class="loader-circle">
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>

    <div v-show="!isLoading" class="camera-box" :class="{ flash: isShotPhoto }">
      <div class="camera-shutter" :class="{ flash: isShotPhoto }"></div>

      <video v-show="!isPhotoTaken" ref="camera" :width="1450" :height="937.5" autoplay></video>

      <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas" :width="1450" :height="937.5"></canvas>
    </div>

    <div v-if="!isLoading" class="camera-shoot">
      <button type="button" class="button" @click="takePhoto">
        <img src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isPhotoTaken: false,
      isShotPhoto: false,
      isLoading: false,
      link: "#",
    };
  },
  created() {
    this.createCameraElement();
  },
  methods: {
    createCameraElement() {
      this.isLoading = true;

      const constraints = (window.constraints = {
        audio: false,
        video: true,
      });

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          this.isLoading = false;
          this.$refs.camera.srcObject = stream;
        })
        .catch(() => {
          this.isLoading = false;
          console.log("Error creating camera element");
        });
    },

    stopCameraStream() {
      let tracks = this.$refs.camera.srcObject.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    },

    takePhoto() {
      if (!this.isPhotoTaken) {
        this.isShotPhoto = true;

        const FLASH_TIMEOUT = 50;

        setTimeout(() => {
          this.isShotPhoto = false;
        }, FLASH_TIMEOUT);
      }

      this.isPhotoTaken = !this.isPhotoTaken;

      const context = this.$refs.canvas.getContext("2d");
      context.drawImage(this.$refs.camera, 0, 0, 450, 337.5);
      this.stopCameraStream();
      this.downloadImage();
    },

    downloadImage() {
      const canvas = document
        .getElementById("photoTaken")
        .toDataURL("image/jpeg")
        .replace("image/jpeg", "image/octet-stream");
      this.$emit("photoTaken", canvas);
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
  width: 1500px;
}
.camera-button {
  margin-bottom: 2rem;
}
</style>
