import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      _id: null
    }
  },
  mutations: {
    CURRENT_USER(state, res) {
      state.user._id = res.data._id;
    }
  },
  actions: {
    async updateUserSession(context) {
      const res = await axios.get('/api/local');
      context.commit("CURRENT_USER", res);
    }
  }
})
