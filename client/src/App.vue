<template>
  <div id="app">
    <b-navbar data-bs-theme="dark" style="background: #00b8d1" toggleable="lg">
      <b-navbar-brand to="/"><img :src="logo" width="52" height="35" /></b-navbar-brand>
      <b-navbar-toggle target="navbar-toggle-collapse" />
      <b-collapse id="navbar-toggle-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/items">Items</b-nav-item>
          <b-nav-item to="/orders">Orders</b-nav-item>
          <b-nav-item to="/owners">Owners</b-nav-item>
          <b-nav-item to="/templates">Templates</b-nav-item>
          <b-nav-item to="/acquisitions">Acquisitions</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav v-if="session.loggedIn" class="ms-auto">
          <b-nav-item disabled>{{ session.email }}</b-nav-item>
          <b-nav-item to="/changePassword">Change Password</b-nav-item>
          <b-nav-item to="/logout">Logout</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav v-else class="ms-auto">
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
    // Cookies aren't reactive, so re-read them whenever the route changes
    // (login and logout both navigate), keeping the navbar in step.
    session() {
      void this.$route.fullPath;
      return {
        loggedIn: !!this.$cookie.get("token"),
        email: this.$cookie.get("email") || "",
      };
    },
    logo() {
      return `${import.meta.env.BASE_URL}logo.png`;
    },
  },
};
</script>
