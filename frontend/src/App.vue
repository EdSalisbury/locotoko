<template>
  <v-app>
    <v-toolbar app color="indigo">
      <v-btn icon>
        <router-link to="/"
          ><v-icon icon="mdi-home"
        /></router-link>
      </v-btn>
      <v-toolbar-title
        ><span>LocoToko</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        ><router-link to="/about"
          >About</router-link
        ></v-btn
      >
      <v-btn
        ><router-link to="/login"
          >Login</router-link
        ></v-btn
      >
      <v-btn
        ><router-link to="/register"
          >Register</router-link
        ></v-btn
      >
    </v-toolbar>

    <v-main>
      <!-- <v-container> -->
      <router-view></router-view>
      <!-- </v-container> -->
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data: () => ({}),
};
</script>
