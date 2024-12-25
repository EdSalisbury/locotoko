<script>
export default {
  async created() {
    this.$cookie.set("token", "", { expires: 0 });
    this.$cookie.set("userId", "", { expires: 0 });
    this.$cookie.set("email", "", { expires: 0 });

    this.$router.push({ path: "/" });
  },
};
</script>
