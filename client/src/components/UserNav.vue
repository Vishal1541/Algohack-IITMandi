<template>
  <div v-if="load_user_navbar">
    <b-nav style="margin-left: 30px">
      <span class="user-nav"
        >User: {{ user_info.name }} ({{ user_info.username }})</span
      >
      <span class="user-nav">
        Time left:
        <span>
          <strong
            >{{ TimeLeft.hours }}:{{ TimeLeft.minutes }}:{{
              TimeLeft.seconds
            }}</strong
          >
        </span>
      </span>
      <span class="user-nav">Your score: {{ user_info.totalScore }}</span>
      <span class="user-nav"
        >Hints taken: {{ user_info.totalHintsTaken }} /
        {{ user_info.totalAvailableHints }}</span
      >
    </b-nav>
  </div>
  <div v-else>
    <b-spinner variant="primary"></b-spinner>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import router from "../router";

export default {
  data() {
    return {
      id: null,
      user_info: null,
      hints_taken: null,
      contest_setting: null,
      current_contest_status: null,
      load_user_navbar: false,
      ContestStatus: {
        NOT_STARTED: "NOT_STARTED",
        RUNNING: "RUNNING",
        ENDED: "ENDED",
      },
      TimeLeft: {
        hours: 0,
        minutes: 0,
        seconds: 0,
      },
    };
  },
  methods: {
    ...mapActions(["updateUserSession"]),
    updateContestTimeLeft() {
      const date1 = new Date();
      const date2 = new Date(this.contest_setting.endDateTime);

      const diffTime = Math.abs(date2 - date1);
      var diff_in_s = Math.ceil(diffTime / 1000);
      var diff_in_m = parseInt(diff_in_s / 60);
      var diff_in_h = parseInt(diff_in_s / (60 * 60));
      diff_in_m -= diff_in_h * 60;
      diff_in_s -= diff_in_h * 60 * 60 + diff_in_m * 60;

      this.TimeLeft = {
        hours: diff_in_h,
        minutes: diff_in_m,
        seconds: diff_in_s,
      };
    },
  },
  async mounted() {
    await this.updateUserSession();
    this.id = this.$store.state.user._id;
    if (this.id === null) {
      router.push("/");
    } else {
      this.user_info = (
        await axios.get("/api/v1/contest/fetch-user-navbar-info")
      ).data;
      this.contest_setting = (
        await axios.get("/api/v1/contest/fetch-contest-settings")
      ).data;
      this.current_contest_status = (
        await axios.get("/api/v1/public/fetch-contest-status")
      ).data.contestStatus;
      if (this.current_contest_status === this.ContestStatus.RUNNING) {
        setInterval(this.updateContestTimeLeft, 1000);
        this.load_user_navbar = true;
      }
    }
  },
};
</script>

<style scoped>
.user-nav {
  font-size: 12px;
  margin-right: 50px;
}
</style>
