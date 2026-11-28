<template>
  <b-card>
    <b-card-title>API Keys</b-card-title>
    <b-card-body>
      <p>
        A key lets another program (like Lucida) use Locotoko as you, without logging in. Anyone with the key can, so
        keep it private and revoke any you no longer use.
      </p>
      <b-alert :model-value="!!error" variant="danger">{{ error }}</b-alert>

      <b-alert :model-value="!!newKey" variant="success">
        <div><b>Key "{{ newKey?.name }}" created.</b> Copy it now: it won't be shown again.</div>
        <div class="d-flex align-items-center mt-2">
          <code class="new-key me-2">{{ newKey?.key }}</code>
          <b-button size="sm" variant="primary" @click="copyKey">{{ copied ? "Copied" : "Copy" }}</b-button>
        </div>
      </b-alert>

      <b-form class="d-flex align-items-end mb-3" @submit="createKey">
        <div class="me-2 flex-grow-1" style="max-width: 400px">
          <TextInput v-model="name" label="Key name (e.g. Lucida)" />
        </div>
        <b-button type="submit" variant="primary" :disabled="!name.trim()">Create API key</b-button>
      </b-form>

      <b-table-simple v-if="keys.length" small striped>
        <b-thead>
          <b-tr>
            <b-th>Name</b-th>
            <b-th>Made</b-th>
            <b-th>Last used</b-th>
            <b-th />
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-for="key in keys" :key="key.id">
            <b-td>{{ key.name }}</b-td>
            <b-td>{{ formatDate(key.createdAt) }}</b-td>
            <b-td>{{ key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never" }}</b-td>
            <b-td class="text-end">
              <b-button size="sm" variant="danger" @click="revokeKey(key)">Revoke</b-button>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
      <p v-else class="text-muted">No API keys yet.</p>
    </b-card-body>
  </b-card>
</template>

<script>
import TextInput from "@/components/TextInput.vue";
import api from "@/api";

export default {
  components: { TextInput },
  data() {
    return {
      token: "",
      keys: [],
      name: "",
      newKey: null,
      copied: false,
      error: "",
    };
  },
  async created() {
    this.token = this.$cookie.get("token");
    if (!this.token) {
      this.$router.push({ path: "/login" });
      return;
    }
    await this.loadKeys();
  },
  methods: {
    async loadKeys() {
      try {
        this.keys = await api.getApiKeys(this.token);
      } catch (err) {
        this.error = err.message;
      }
    },
    async createKey(event) {
      event.preventDefault();
      this.error = "";
      this.copied = false;
      try {
        this.newKey = await api.createApiKey(this.token, { name: this.name.trim() });
        this.name = "";
        await this.loadKeys();
      } catch (err) {
        this.error = err.message;
      }
    },
    async copyKey() {
      try {
        await navigator.clipboard.writeText(this.newKey.key);
        this.copied = true;
      } catch {
        this.error = "Couldn't copy; select the key and copy it by hand.";
      }
    },
    async revokeKey(key) {
      if (!window.confirm(`Revoke "${key.name}"? Anything using it stops working.`)) {
        return;
      }
      this.error = "";
      try {
        await api.revokeApiKey(this.token, key.id);
        if (this.newKey?.id === key.id) {
          this.newKey = null;
        }
        await this.loadKeys();
      } catch (err) {
        this.error = err.message;
      }
    },
    formatDate(value) {
      return new Date(value).toLocaleString();
    },
  },
};
</script>

<style scoped>
.new-key {
  user-select: all;
  word-break: break-all;
}
</style>
