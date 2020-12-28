<template>
  <div>
    <div v-if="page_loaded">
      <Header />

      <b-col sm="4" offset="4">
        <b-form class="register-form">
          <center>
            <h2>Register</h2>
          </center>
          <b-form-group id="register-name" label="Full Name:">
            <b-form-input id="input-2" v-model="form.name" required></b-form-input>
          </b-form-group>

          <b-form-group id="register-username" label="IIT Mandi Roll Number:">
            <b-form-input id="input-2" v-model="form.username" required></b-form-input>
          </b-form-group>

          <b-form-group id="register-password" label="Password:">
            <b-form-input id="input-3" v-model="form.password" type="password" required></b-form-input>
          </b-form-group>

          <center>
            <span class="btn" @click="register()">
              <div v-if="submitted">&lt;Please Wait... /&gt;</div>
              <div v-else>&lt;Register /&gt;</div>
            </span>
            <span class="btn" @click="clearAll()">
              <div>&lt;Reset /&gt;</div>
            </span>
            <br />
            <div class="message">{{message}}</div>
          </center>
        </b-form>
      </b-col>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import router from '../router';
import { mapActions } from 'vuex';
import Header from '../views/Header.vue';

export default {
  components: {
    Header
  },
  data() {
    return {
      page_loaded: false,
      id: null,
      submitted: false,
      message: '',
      form: {
        name: '',
        username: '',
        password: ''
      }
    }
  },
  methods: {
    ...mapActions(['updateUserSession']),
    async register() {
      if (this.submitted) return;
      this.submitted = true;
      this.message = '';
      await axios.post('/api/auth/register', this.form)
        .then((res) => {
          this.message = res.data;
        })
        .catch(() => {
        })
      this.submitted = false;
    },
    clearAll() {
      this.form.name = this.form.username = this.form.password = '';
    }
  },
  async mounted() {
    try {
      await this.updateUserSession();
      this.id = this.$store.state.user._id;
      if (this.id !== null) {
        router.push('/');
      }
      this.page_loaded = true;
    } catch (error) {
      router.push('/');
    }
  }
}
</script>

<style scoped>
.register-form {
  margin-top: 20px;
}
.btn {
  margin-top: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid green;
}
.message {
  color: black;
  font-size: 18px;
}
</style>
