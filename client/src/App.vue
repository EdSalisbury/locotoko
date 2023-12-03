<template>
  <div id="app">
    <b-navbar type="dark" style="background: #00b8d1" toggleable="lg">
      <b-navbar-brand href="/"><img :src="logo" width="52" height="35" /></b-navbar-brand>
      <b-navbar-toggle target="navbar-toggle-collapse"></b-navbar-toggle>
      <b-collapse id="navbar-toggle-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/items">Items</b-nav-item>
          <b-nav-item to="/orders">Orders</b-nav-item>
          <b-nav-item to="/owners">Owners</b-nav-item>
          <b-nav-item to="/templates">Templates</b-nav-item>
          <b-nav-item to="/acquisitions">Acquisitions</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav v-if="this.$cookie.get('token')" class="ml-auto">
          <b-nav-item disabled>{{ this.$cookie.get("email") }}</b-nav-item>
          <b-nav-item to="/logout">Logout</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav v-else class="ml-auto">
          <b-nav-item to="/login">Login</b-nav-item>
          <b-nav-item to="/register">Register</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
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
    logo: function () {
      return `${process.env.BASE_URL}logo.png`;
    },
  },
};
</script>
