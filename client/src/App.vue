<template>
  <div id="app">
    <b-navbar type="dark" variant="success">
      <b-navbar-brand>LocoToko</b-navbar-brand>
      <b-navbar-nav>
        
        <b-nav-item to="/items">Items</b-nav-item>
        <b-nav-item to="/owners"
          >Owners</b-nav-item
        >
        <b-nav-item to="/templates"
          >Templates</b-nav-item
        >
        <b-nav-item to="/login">Login</b-nav-item>
        <b-nav-item to="/register"
          >Register</b-nav-item
        >
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
    isLoggedIn: function () {
      return this.$cookie.get("token");
    },
  },
};
</script>
