<template>
  <b-container fluid class="section">
    <h1>Images</h1>
    <b-row v-for="row in 3" :key="'row_' + row" class="row">
      <b-col v-for="index in rowIndexes(row)" :key="'col_' + index" class="col">
        <b-img thumbnail :src="localImages[index]" class="thumbnail rounded" @click="preview(index)" />
        <template v-if="edit && localImages[index] !== NO_IMAGE">
          <b-button class="deleteButton" @click="$emit('deleteImage', index)">
            <i class="bi bi-trash-fill" />
          </b-button>
          <b-button v-if="index > 0" class="leftButton" @click="$emit('moveImageLeft', index)">
            <i class="bi bi-arrow-left-square-fill" />
          </b-button>
          <b-button v-if="index < images.length - 1" class="rightButton" @click="$emit('moveImageRight', index)">
            <i class="bi bi-arrow-right-square-fill" />
          </b-button>
        </template>
      </b-col>
    </b-row>

    <!-- One preview modal for all thumbnails (replaces one vue-js-modal per image). -->
    <b-modal v-model="previewOpen" size="xl" no-footer centered body-class="text-center">
      <b-img fluid thumbnail :src="previewSrc" />
    </b-modal>
  </b-container>
</template>

<script>
const NO_IMAGE = "/noImage.png";

export default {
  props: {
    images: { type: Array, default: () => [] },
    edit: { type: Boolean, default: false },
  },
  emits: ["deleteImage", "moveImageLeft", "moveImageRight"],
  data() {
    return {
      NO_IMAGE,
      previewOpen: false,
      previewSrc: "",
    };
  },
  computed: {
    // Always 12 slots (3 rows of 4); empty ones show the placeholder image.
    localImages() {
      return Array.from({ length: 12 }, (_, i) => this.images?.[i] || NO_IMAGE);
    },
  },
  methods: {
    rowIndexes(row) {
      const start = (row - 1) * 4;
      return [start, start + 1, start + 2, start + 3];
    },
    preview(index) {
      this.previewSrc = this.localImages[index];
      this.previewOpen = true;
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
  cursor: pointer;
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
  position: relative;
}
</style>
