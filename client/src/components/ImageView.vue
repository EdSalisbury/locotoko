<template>
  <b-container class="frame rounded">
    <b-row class="row">
      <b-col class="col" v-for="(image, index) in localImages.slice(0, 4)" :key="'col_' + index">
        <b-img :id="'thumb_' + index" thumbnail :src="image" class="thumbnail rounded" @click="preview" />
        <b-modal centered size="xl" class="img-modal" hide-header hide-footer :id="'img_' + index">
          <b-img :src="localImages[index]" />
        </b-modal>
        <b-button class="deleteButton" v-show="edit" v-if="image !== '/noImage.png'" @click="deleteImage(index)">
          <b-icon-trash-fill />
        </b-button>
      </b-col> </b-row
    ><b-row class="row">
      <b-col class="col" v-for="(image, index) in localImages.slice(4, 8)" :key="'col_' + index">
        <b-img :id="'thumb_' + index + 4" thumbnail :src="image" class="thumbnail rounded" @click="preview" />
        <b-modal centered size="xl" class="img-modal" hide-header hide-footer :id="'img_' + index + 4">
          <b-img :src="localImages[index + 4]" />
        </b-modal>
        <b-button class="deleteButton" v-show="edit" v-if="image !== '/noImage.png'" @click="deleteImage(index)">
          <b-icon-trash-fill />
        </b-button>
      </b-col>
    </b-row>
    <b-row class="row">
      <b-col class="col" v-for="(image, index) in localImages.slice(8, 12)" :key="'col_' + index">
        <b-img :id="'thumb_' + index + 8" thumbnail :src="image" class="thumbnail rounded" @click="preview" />
        <b-modal centered size="xl" class="img-modal" hide-header hide-footer :id="'img_' + index + 8">
          <b-img :src="localImages[index + 8]" />
        </b-modal>
        <b-button class="deleteButton" v-show="edit" v-if="image !== '/noImage.png'" @click="deleteImage(index)">
          <b-icon-trash-fill />
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
  data() {
    return {
      newImages: [],
    };
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
      this.$bvModal.show(modalId);
    },
    deleteImage(index) {
      this.$emit("deleteImage", index);
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
  top: 20px;
  right: 20px;
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
