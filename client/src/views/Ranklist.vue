<template>
  <div>
    <Header />
    <div>
      <div v-if="is_before_contest === null">
        <b-spinner variant="primary"></b-spinner>
      </div>
      <div v-if="is_before_contest === true">
        <center>
          <h3>
            Contest not yet started
          </h3>
        </center>
      </div>
      <div v-if="is_before_contest === false">
        <b-col sm="10" offset="1">
          <div v-if="table_loaded" class="table-ranklist">
            <center>
              <h3>Ranklist (freezed)</h3>
            </center>
            <b-table
              :items="ranklist"
              :fields="fields"
              head-variant="light"
              :tbody-tr-class="rowClass"
              bordered
              small
            >
              <template v-for="(qID, index) in quesIDs"
              v-slot:[`cell(${qID})`]="data">
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
import Header from './Header';
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
  components: {
    Header
  },
  data() {
    return {
      id: null,
      table_loaded: false,
      user_data: null,
      users: [],
      problems: [],
      quesIDs: [],
      ranklist: [],
      contest_settings: null,
      is_before_contest: null,
      fields: ['rank', 'name', 'penalty', 'totalScore']
    }
  },
  methods: {
    ...mapActions(['updateUserSession']),
    qIDCols(data) {
      if (!data)
        return '';
      var col_print_html = '';
      if (data.quesScore !== 0)
        col_print_html += data.quesScore;
      if (data.hasHintTaken)
        col_print_html += '&#128161;';
      return col_print_html;
    },
    rowClass(item, type) {
      if (!item || type !== 'row') return
      if (item.self === true) return 'table-success'
    },
    async getUserData() {
      await axios.get('/api/auth/user-data')
        .then((res) => {
          this.user_data = res.data;
        })
    },
    async getContestSettings() {
      await axios.get('/api/normal/contest-settings')
        .then((res) => {
          this.contest_settings = res.data;
        })
    },
    search(nameKey, myArray) {
      for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].qID === nameKey) {
          return myArray[i];
        }
      }
    },
    cmp(userA, userB) {
      if (userA.totalScore == 0)
        return 1;
      if (userB.totalScore == 0)
        return -1;
      if (userA.totalScore > userB.totalScore)
        return -1;
      if (userA.totalScore < userB.totalScore)
        return 1;
      if(userA.penalty < userB.penalty)
        return -1;
      return 1;
    },
    updateRank() {
      var curr_rank = 1;
      for (var i = 0; i < this.ranklist.length; i++) {
        if (this.ranklist[i].totalScore == 0)
          return;
        if (i == 0)
          this.ranklist[i].rank = curr_rank;
        else {
          if (this.ranklist[i].totalScore === this.ranklist[i - 1].totalScore
            && this.ranklist[i].penalty === this.ranklist[i - 1].penalty)
            this.ranklist[i].rank = curr_rank;
          else {
            curr_rank++;
            this.ranklist[i].rank = curr_rank;
          }
        }
      }
    },
    isBeforeContest() {
      const contest_start_dt = new Date(this.contest_settings.startDateTime).getTime();
      const curr_dt = new Date().getTime();
      return curr_dt < contest_start_dt;
    }
  },
  async mounted() {
    await this.updateUserSession();
    this.id = this.$store.state.user._id;
    if (this.id)
      await this.getUserData();
    await this.getContestSettings();
    if (this.isBeforeContest()) {
      this.is_before_contest = true;
    } else {
      this.is_before_contest = false;
      await axios.get('/api/normal/all-users')
        .then(async (res_users) => {
          this.users = res_users.data;
          await axios.get('/api/normal/all-problems')
            .then((res_problems) => {
              this.problems = res_problems.data;
            })
        })
      this.problems.forEach(problem => {
        this.fields.push(problem.qID);
        this.quesIDs.push(problem.qID);
      });
      this.users.forEach(user => {
        var obj = {
          name: user.name,
          penalty: user.totalPenalty,
          totalScore: user.totalScore
        };
        user.quesAttempts.forEach(quesAttempt => {
          obj[quesAttempt.qID] = quesAttempt;
          obj[quesAttempt.qID]['quesScore'] = 0;
          if (quesAttempt.hasSolved) {
            var ques_points = parseInt(this.search(quesAttempt.qID, this.problems).points);
            for (var i = 0; i < quesAttempt.wrongAttemptsCount; i++) {
              ques_points = parseInt(ques_points * this.contest_settings.pointReductionConstant);
            }
            if (quesAttempt.hasHintTaken)
              ques_points = parseInt(ques_points * 0.5);
            ques_points = Math.max(1, ques_points);
            obj[quesAttempt.qID]['quesScore'] = ques_points;
          }
        });
        if (this.user_data && this.user_data.username === user.username)
          obj.self = true;
        this.ranklist.push(obj);
      });
      this.ranklist.sort(this.cmp);
      this.updateRank();
      this.table_loaded = true;
    }
  }
}
</script>

<style scoped>
.table-ranklist {
  font-size: 10px;
}
</style>
