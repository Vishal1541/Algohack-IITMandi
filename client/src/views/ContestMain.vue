<template>
  <div v-if="id">
    <Header />
    <div
      v-if="current_contest_status === ContestStatus.NOT_STARTED"
      class="before-contest"
    >
      <h3>Contest starts in:</h3>
      <h2>
        {{ TimeLeft.hours }}:{{ TimeLeft.minutes }}:{{ TimeLeft.seconds }}
      </h2>
    </div>
    <div
      v-if="current_contest_status === ContestStatus.ENDED"
      class="after-contest"
    >
      <h3>Contest ended!</h3>
    </div>
    <div
      v-if="current_contest_status === ContestStatus.RUNNING"
      class="running-contest"
    >
      <UserNav />
      <b-row style="margin-top: 40px">
        <b-col cols="6" offset="3">
          <ProblemsTable />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "../router";
import { mapActions } from "vuex";
import Header from "../views/Header.vue";
import UserNav from "../components/UserNav.vue";
import ProblemsTable from "../components/ProblemsTable";

export default {
  components: {
    Header,
    UserNav,
    ProblemsTable,
  },
  data() {
    return {
      id: null,
      contest_setting: null,
      current_contest_status: null,
      ContestStatus: {
        NOT_STARTED: "NOT_STARTED",
        RUNNING: "RUNNING",
        ENDED: "ENDED",
      },
      TimeLeft: {
        hours: null,
        minutes: null,
        seconds: null,
      },
    };
  },
  methods: {
    ...mapActions(["updateUserSession"]),
    async updateContestTime() {
      const date1 = new Date();
      const date2 = new Date(
        this.current_contest_status === this.ContestStatus.RUNNING
          ? this.contest_setting.endDateTime
          : this.contest_setting.startDateTime
      );

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

      if (
        this.TimeLeft.hours === 0 &&
        this.TimeLeft.minutes === 0 &&
        this.TimeLeft.seconds === 1
      ) {
        this.current_contest_status = (
          await axios.get("/api/v1/public/fetch-contest-status")
        ).data.contestStatus;
      }
    },
  },
  async mounted() {
    await this.updateUserSession();
    this.id = this.$store.state.user._id;
    if (this.id === null) {
      router.push("/");
    } else {
      this.current_contest_status = (
        await axios.get("/api/v1/public/fetch-contest-status")
      ).data.contestStatus;

      this.contest_setting = (
        await axios.get("/api/v1/contest/fetch-contest-settings")
      ).data;

      setInterval(this.updateContestTime, 1000);
    }
  },
};
</script>

<style scoped>
.before-contest {
  padding: 150px 0;
  text-align: center;
  vertical-align: middle;
}
.after-contest {
  padding: 150px 0;
  text-align: center;
  vertical-align: middle;
}
</style>
