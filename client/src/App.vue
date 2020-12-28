<template>
  <div id="app">
    <div class="content">
      <center>
        <h1>ALGOHACK - IIT MANDI</h1>
      </center>
      <hr />
      <b-container>
        <router-view />
      </b-container>
    </div>
    <footer class="footer">
      <hr />
      <center>&copy; 2020, Vishal Anand</center>
    </footer>
  </div>
</template>

<script>
import { mapActions } from "vuex"
import router from "./router"

export default {
  name: 'App',
  data() {
    return {
      id: null
    }
  },
  methods: {
    ...mapActions(["updateUserSession"])
  },
  async mounted() {
    try {
      await this.updateUserSession();
      this.id = this.$store.state.user._id;
    } catch (error) {
      console.log(error);
      router.push("/");
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Press+Start+2P|VT323|Share+Tech+Mono|Orbitron|Tomorrow&display=swap');

* {
  font: 13px/1.4 'Tomorrow', 'monoscape';
  /* line-height: 18px; */
  /* background: #292929;
  color: rgb(3, 180, 33); */
}
.hr-tag {
  border: 1px solid rgb(184, 184, 184);
}
html,
body {
  height: 96%;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
.content {
  flex: 1 0 auto;
  /* Prevent Chrome, Opera, and Safari from letting these items shrink to smaller than their content's default minimum size. */
  padding: 10px;
}

.footer {
  flex-shrink: 0;
  /* Prevent Chrome, Opera, and Safari from letting these items shrink to smaller than their content's default minimum size. */
  padding: 10px;
}
</style>
