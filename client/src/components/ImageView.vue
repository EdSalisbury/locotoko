<template>
  <b-container class="frame rounded">
    <b-row class="row">
      <b-col class="col" v-for="(image, index) in localImages.slice(0, 4)" :key="'col_' + index">
        <b-img :id="'thumb_' + index" thumbnail :src="image" class="thumbnail rounded" @click="preview" />
        <modal :name="'img_' + index" width="800px" height="auto" style="text-align: center">
          <b-img fluid thumbnail :src="localImages[index]" />
        </modal>
        <b-button class="deleteButton" v-show="edit" v-if="image !== '/noImage.png'" @click="deleteImage(index)">
          <b-icon-trash-fill />
        </b-button>
        <b-button
          class="leftButton"
          v-show="edit"
          v-if="image !== '/noImage.png' && index > 0"
          @click="moveImageLeft(index)"
        >
          <b-icon-arrow-left-square-fill />
        </b-button>
        <b-button
          class="rightButton"
          v-show="edit"
          v-if="image !== '/noImage.png' && index < images.length - 1"
          @click="moveImageRight(index)"
        >
          <b-icon-arrow-right-square-fill />
        </b-button>
      </b-col> </b-row
    ><b-row class="row">
      <b-col class="col" v-for="(image, index) in localImages.slice(4, 8)" :key="'col_' + index">
        <b-img :id="'thumb_' + index + 4" thumbnail :src="image" class="thumbnail rounded" @click="preview" />
        <modal :name="'img_' + index + 4" width="800px" height="auto" style="text-align: center">
          <b-img fluid thumbnail :src="localImages[index + 4]" />
        </modal>
        <b-button class="deleteButton" v-show="edit" v-if="image !== '/noImage.png'" @click="deleteImage(index)">
          <b-icon-trash-fill />
        </b-button>
        <b-button
          class="leftButton"
          v-show="edit"
          v-if="image !== '/noImage.png' && index + 4 > 0"
          @click="moveImageLeft(index + 4)"
        >
          <b-icon-arrow-left-square-fill />
        </b-button>
        <b-button
          class="rightButton"
          v-show="edit"
          v-if="image !== '/noImage.png' && index + 4 < images.length - 1"
          @click="moveImageRight(index + 4)"
        >
          <b-icon-arrow-right-square-fill />
        </b-button>
      </b-col>
    </b-row>
    <b-row class="row">
      <b-col class="col" v-for="(image, index) in localImages.slice(8, 12)" :key="'col_' + index">
        <b-img :id="'thumb_' + index + 8" thumbnail :src="image" class="thumbnail rounded" @click="preview" />
        <modal :name="'img_' + index + 8" width="800px" height="auto" style="text-align: center">
          <b-img fluid thumbnail :src="localImages[index + 8]" />
        </modal>
        <b-button class="deleteButton" v-show="edit" v-if="image !== '/noImage.png'" @click="deleteImage(index)">
          <b-icon-trash-fill />
        </b-button>
        <b-button
          class="leftButton"
          v-show="edit"
          v-if="image !== '/noImage.png' && index + 8 > 0"
          @click="moveImageLeft(index + 8)"
        >
          <b-icon-arrow-left-square-fill />
        </b-button>
        <b-button
          class="rightButton"
          v-show="edit"
          v-if="image !== '/noImage.png' && index + 8 < images.length - 1"
          @click="moveImageRight(index + 8)"
        >
          <b-icon-arrow-right-square-fill />
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  props: {
    images: Array,
    edit: Boolean,
  },
  computed: {
    localImages() {
      const newImages = Array.from({ ...this.images, length: 12 });
      return newImages.map((image) => (image ? image : "/noImage.png"));
    },
  },
  methods: {
    preview(event) {
      const modalId = "img_" + event.target.id.split("_")[1];
      //this.$bvModal.show(modalId);
      this.$modal.show(modalId);
    },
    deleteImage(index) {
      this.$emit("deleteImage", index);
    },
    moveImageLeft(index) {
      this.$emit("moveImageLeft", index);
    },
    moveImageRight(index) {
      this.$emit("moveImageRight", index);
    },
  },
};
</script>
<style scoped>
.thumbnail {
  text-align: center;
  border: 1px solid black;
  z-index: -1;
  margin: 0;
  padding: 0;
}
.frame {
  background: #ccc;
  border: 1px solid black;
  margin: 0;
  padding: 5px;
}
.deleteButton {
  position: absolute;
  z-index: 0;
  top: 10px;
  right: 10px;
}
.leftButton {
  position: absolute;
  z-index: 0;
  left: 10px;
  bottom: 10px;
}
.rightButton {
  position: absolute;
  z-index: 0;
  right: 10px;
  bottom: 10px;
}
.row {
  margin: 0;
  padding: 0;
}

.col {
  margin: 0;
  padding: 5px;
}
</style>
