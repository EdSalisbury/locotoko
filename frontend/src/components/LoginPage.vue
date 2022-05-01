<template>
  <v-form>
    <v-card elevation="2" class="w-100">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                autofocus
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions
        class="d-flex flex-row-reverse"
      >
        <v-btn> Login </v-btn></v-card-actions
      >
    </v-card>
  </v-form>
</template>
