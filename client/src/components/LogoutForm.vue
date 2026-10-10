<template>
  <div />
</template>

<script>
export default {
  created() {
    this.$cookie.delete("token");
    this.$cookie.delete("userId");
    this.$cookie.delete("email");
    this.$router.push({ path: "/" });
  },
};
</script>
