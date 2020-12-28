<template>
  <div class="header-container">
    <div v-if="page_loaded">
      <b-nav>
        <b-nav-item @click="home" class="nav-link">&lt;Home /&gt;</b-nav-item>
        <b-nav-item v-if="id === null" @click="login" class="nav-link">&lt;Login /&gt;</b-nav-item>
        <b-nav-item v-if="id === null" @click="register" class="nav-link">&lt;Register /&gt;</b-nav-item>
        <b-nav-item v-if="id !== null" @click="contest" class="nav-link">&lt;Past Contest /&gt;</b-nav-item>
        <b-nav-item @click="ranklist" class="nav-link">&lt;Ranklist /&gt;</b-nav-item>
        <b-nav-item
          @click="registeredParticipants"
          class="nav-link"
        >&lt;Registered participants /&gt;</b-nav-item>
        <b-nav-item v-if="id !== null" @click="logout" class="nav-link">&lt;Logout /&gt;</b-nav-item>
      </b-nav>
    </div>
    <div v-else>
      <b-spinner variant="primary"></b-spinner>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import router from '../router';
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      page_loaded: false,
      id: null
    }
  },
  methods: {
    ...mapActions(['updateUserSession']),
    logout() {
      axios.post('/api/auth/logout')
        .then(() => {
          if (this.currentPathname() === '/') {
            location.reload();
          } else {
            router.push('/');
          }
        })
        .catch((err) => {
          console.log(err);
        })
    },
    currentPathname() {
      return window.location.pathname;
    },
    home() {
      if (this.currentPathname() === '/') {
        location.reload();
      } else {
        router.push('/');
      }
    },
    contest() {
      if (this.currentPathname() === '/contest') {
        location.reload();
      } else
        router.push('/contest');
    },
    ranklist() {
      if (this.currentPathname() === '/ranklist') {
        location.reload();
      } else
        router.push('/ranklist');
    },
    login() {
      if (this.currentPathname() === '/login') {
        location.reload();
      } else
        router.push('/login');
    },
    register() {
      if (this.currentPathname() === '/register') {
        location.reload();
      } else
        router.push('/register');
    },
    registeredParticipants() {
      if (this.currentPathname() === '/registered') {
        location.reload();
      } else
        router.push('/registered');
    }
  },
  async mounted() {
    try {
      await this.updateUserSession();
      this.id = this.$store.state.user._id;
      this.page_loaded = true;
    } catch (error) {
      router.push('/');
    }
  }
}
</script>

<style scoped>
.nav-link {
  transition: background-color 0.8s ease;
  border-radius: 5px;
  color: rgba(30, 44, 109, 0.883);
  outline: none;
}
.nav-link :hover {
  transition: background-color 0.8s ease;
  background: rgba(50, 27, 66, 0.883);
  color: rgb(219, 219, 219);
}
.header-container {
  margin-bottom: 10px;
}
</style>
