<template>
  <div class="frame">
    <div class="camera-frame">
      <video v-show="cameraEnabled" ref="camera" class="camera camera-offset" autoplay />
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
</template>
<script>
export default {
  data() {
    return {
      cameraEnabled: false,
      cameraWidth: 0,
      cameraHeight: 0,
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
      const constraints = (window.constraints = {
        audio: false,
        video: true,
      });

      try {
        const camera = await navigator.mediaDevices.getUserMedia(constraints);
        const tracks = camera.getVideoTracks();
        const capabilities = tracks[0].getCapabilities();
        this.$refs.camera.srcObject = camera;
        this.cameraEnabled = true;
        this.cameraWidth = capabilities.width.max;
        this.cameraHeight = capabilities.height.max;
      } catch (e) {
        console.error("Error creating camera element: " + e);
      }
    },

    stopCameraStream() {
      let tracks = this.$refs.camera.srcObject.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    },

    takePhoto() {
      const canvas = document.createElement("canvas");
      canvas.width = this.cameraWidth;
      canvas.height = this.cameraHeight;
      canvas.getContext("2d").drawImage(this.$refs.camera, 0, 0, this.cameraWidth, this.cameraHeight);
      const photo = canvas.toDataURL("image/jpeg", 0.7);
      this.$emit("photoTaken", photo);
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
