<template>
  <div>
    <!-- Rendered off-screen at full viewport width, exactly like vue-html2pdf's
         hidden layout, so html2pdf.js sees the same layout as before. -->
    <section class="pdf-layout">
      <section ref="pdfContent" class="pdf-content">
        <slot />
      </section>
    </section>

    <b-modal v-model="open" size="xl" no-footer :title="title" @hidden="release">
      <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-frame" />
    </b-modal>
  </div>
</template>

<script>


// Replacement for vue-html2pdf (Vue 2 only). Call generatePdf() after the
// slot has the content to print; the PDF opens in a preview modal, where the
// browser's PDF viewer can print or save it.
export default {
  props: {
    title: { type: String, default: "Preview" },
    // Passed straight to html2pdf.js, as the app did with vue-html2pdf.
    options: { type: Object, required: true },
  },
  data() {
    return { open: false, pdfUrl: "" };
  },
  beforeUnmount() {
    this.release();
  },
  methods: {
    async generatePdf() {
      await this.$nextTick();
      this.release();
      // Loaded on demand: html2pdf.js (with jsPDF and html2canvas) is most of
      // the bundle and is only needed when a packing slip is printed.
      const { default: html2pdf } = await import("html2pdf.js");
      this.pdfUrl = await html2pdf().set(this.options).from(this.$refs.pdfContent).output("bloburl");
      this.open = true;
    },
    release() {
      if (this.pdfUrl) {
        URL.revokeObjectURL(this.pdfUrl);
        this.pdfUrl = "";
      }
    },
  },
};
</script>

<style scoped>
.pdf-layout {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: -100vw;
  top: 0;
  z-index: -9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}
.pdf-content {
  width: 100%;
}
.pdf-frame {
  width: 100%;
  height: 75vh;
  border: 0;
}
</style>
