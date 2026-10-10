<template>
  <PackingSlip v-if="order.id" :order="order" />
</template>
<script>
import api from "@/api";
import PackingSlip from "./PackingSlip.vue";
export default {
  components: {
    PackingSlip,
  },
  data() {
    return {
      order: {
        address: {
          Name: "",
        },
      },
    };
  },
  async created() {
    const id = this.$route.params.id;
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
    }
    this.order = await api.getOrder(this.token, id);
  },
};
</script>
