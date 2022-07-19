<template>
  <b-container fluid class="frame rounded">
    <b-row>
      <b-col fluid v-for="(image, index) in localImages.slice(0, 4)" :key="'col_' + index">
        <b-img :id="'thumb_' + index" thumbnail fluid :src="image" class="thumbnail rounded" @click="preview" />
        <b-modal centered size="xl" class="img-modal" hide-header hide-footer :id="'img_' + index">
          <b-img fluid :src="localImages[index]" />
        </b-modal>
      </b-col> </b-row
    ><b-row>
      <b-col v-for="(image, index) in localImages.slice(4, 8)" class="image rounded" :key="'col_' + index">
        <b-img :id="'thumb_' + index + 4" thumbnail fluid :src="image" class="thumbnail rounded" @click="preview" />
        <b-modal centered size="xl" class="img-modal" hide-header hide-footer :id="'img_' + index + 4">
          <b-img fluid :src="localImages[index + 4]" />
        </b-modal>
      </b-col>
    </b-row>
    <b-row>
      <b-col v-for="(image, index) in localImages.slice(8, 12)" class="image rounded" :key="'col_' + index">
        <b-img :id="'thumb_' + index + 8" thumbnail fluid :src="image" class="thumbnail rounded" @click="preview" />
        <b-modal centered size="xl" class="img-modal" hide-header hide-footer :id="'img_' + index + 8">
          <b-img fluid :src="localImages[index + 8]" />
        </b-modal>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  props: {
    images: Array,
  },
  computed: {
    localImages() {
      return Array.from({ ...this.images, length: 12 });
    },
  },
  methods: {
    preview(event) {
      const modalId = "img_" + event.target.id.split("_")[1];
      this.$bvModal.show(modalId);
    },
  },
};
</script>
<style scoped>
.thumbnail {
  text-align: center;
  border: 1px solid black;
  margin: 10px;
}
.frame {
  background: #ccc;
  border: 1px solid black;
  margin-left: 0px;
  margin-top: 10px;
  padding: 20px;
}
</style>
