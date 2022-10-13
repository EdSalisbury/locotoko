<template>
  <PackingSlip :order="this.order" />
</template>
<script>
import api from "@/api";
import PackingSlip from "./PackingSlip";
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
    this.order = await api.getOrder(this.token, id);
  },
};
</script>
