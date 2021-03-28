<template>
  <div>
    <Header />
    <div>
      <div v-if="current_contest_status === null">
        <b-spinner variant="primary"></b-spinner>
      </div>
      <div v-if="current_contest_status === ContestStatus.NOT_STARTED">
        <center>
          <h3>Contest not yet started</h3>
        </center>
      </div>
      <div
        v-if="
          (current_contest_status === ContestStatus.RUNNING ||
            current_contest_status === ContestStatus.ENDED) &&
          table_loaded
        "
      >
        <b-col sm="10" offset="1">
          <div class="table-ranklist">
            <center>
              <h3>Ranklist</h3>
            </center>
            <b-table
              :items="ranklist"
              :fields="fields"
              head-variant="light"
              :tbody-tr-class="rowClass"
              bordered
              small
            >
              <template
                v-for="(qID, index) in quesIDs"
                v-slot:[`cell(${qID})`]="data"
              >
                <span :key="index">
                  <center v-html="qIDCols(data.item[qID])"></center>
                </span>
              </template>
            </b-table>
          </div>
        </b-col>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./Header";
import axios from "axios";
import { mapActions } from "vuex";

export default {
  components: {
    Header,
  },
  data() {
    return {
      id: null,
      table_loaded: false,
      user_metadata: null,
      users: [],
      problems: [],
      quesIDs: [],
      ranklist: [],
      contest_settings: null,
      current_contest_status: null,
      ContestStatus: {
        NOT_STARTED: "NOT_STARTED",
        RUNNING: "RUNNING",
        ENDED: "ENDED",
      },
      fields: ["rank", "name", "penalty", "totalScore"],
    };
  },
  methods: {
    ...mapActions(["updateUserSession"]),
    qIDCols(data) {
      if (!data) return "";
      var col_print_html = "";
      if (data.quesScore !== 0) col_print_html += data.quesScore;
      if (data.hasHintTaken) col_print_html += "&#128161;";
      return col_print_html;
    },
    rowClass(item, type) {
      if (!item || type !== "row") return;
      if (item.self === true) return "table-success";
    },
  },
  async mounted() {
    // Fetching contest running status.
    this.current_contest_status = (
      await axios.get("/api/v1/public/fetch-contest-status")
    ).data.contestStatus;
    if (this.current_contest_status === this.ContestStatus.NOT_STARTED) {
      return;
    }

    // Fetching logged in user (if any) metadata.
    await this.updateUserSession();
    this.id = this.$store.state.user._id;
    if (this.id) {
      this.user_metadata = (
        await axios.get("/api/v1/public/fetch-user-metadata")
      ).data;
    }

    // Fetching all problems names used in table columns.
    this.problems = (
      await axios.get("/api/v1/public/fetch-all-questions-metadata")
    ).data;
    this.problems.forEach((problem) => {
      this.fields.push(problem.qID);
      this.quesIDs.push(problem.qID);
    });

    // Fetching the ranklist.
    this.ranklist = (await axios.get("/api/v1/public/fetch-ranklist")).data;

    // Highlighting the table row for the user is logged in.
    for (var i = 0; i < this.ranklist.length; i++) {
      if (
        this.user_metadata &&
        this.user_metadata.username === this.ranklist[i].username
      ) {
        this.ranklist[i].self = true;
      }
    }

    // Rendering the table.
    this.table_loaded = true;
  },
};
</script>

<style scoped>
.table-ranklist {
  font-size: 10px;
}
</style>
