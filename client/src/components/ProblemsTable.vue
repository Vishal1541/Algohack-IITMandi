<template>
  <div class="container">
    <center>
      <h3>Problems</h3>
    </center>
    <div v-if="is_table_loading">
      <b-spinner variant="primary"></b-spinner>
    </div>
    <div v-else>
      <b-table :items="table_entries" :fields="fields">
        <template v-slot:cell(SNo)="data">
          <span @click="openProblem(data.index)" class="problem-link">
            {{ data.index + 1 }}</span
          >
        </template>
        <template v-slot:cell(Question)="data">
          <span @click="openProblem(data.index)" class="problem-link">
            {{ data.item.name }}
            <b-icon
              icon="alert-circle-fill"
              variant="warning"
              v-if="data.item.hasHintTaken"
              v-b-popover.hover.top="'Hint taken for this question'"
            ></b-icon>
            <b-badge variant="success" v-if="data.item.hasSolved"
              >Hacked</b-badge
            >
          </span>
        </template>
        <template v-slot:cell(MaxPoints)="data">{{
          data.item.points
        }}</template>
        <template v-slot:cell(CurrentPoints)="data">
          <span :class="currentPointsClass(data.item.hasSolved)">{{
            data.item.currentPoints
          }}</span>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "../router";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      fields: ["SNo", "Question", "CurrentPoints", "MaxPoints"],
      table_entries: [],
      is_table_loading: null,
    };
  },
  methods: {
    openProblem(i) {
      router.push("/contest/problem/" + this.table_entries[i].qID);
    },
    currentPointsClass(has_solved) {
      if (has_solved) return "solved";
      return "not-solved";
    },
    ...mapActions(["updateUserSession"]),
  },
  async mounted() {
    this.is_table_loading = true;
    await this.updateUserSession();
    this.id = this.$store.state.user._id;
    if (this.id === null) {
      router.push("/");
    } else {
      await axios.get("/api/v1/contest/fetch-problems-table").then((res) => {
        this.table_entries = res.data;
        this.is_table_loading = false;
      });
    }
  },
};
</script>

<style scoped>
.problem-link {
  cursor: pointer;
  color: rgba(141, 104, 3, 0.883);
}
.solved {
  color: black;
}
.not-solved {
  color: grey;
}
</style>
