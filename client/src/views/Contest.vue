<template>
  <div v-if="page_loaded">
    <Header />
    <div v-if="contest_phase === -1" class="before-contest">
      <h3>Contest starts in:</h3>
      <h2>{{left_h}}:{{left_m}}:{{left_s}}</h2>
    </div>
    <div v-else-if="contest_phase === 1" class="after-contest">
      <h3>Contest ended!</h3>
    </div>
    <div v-else-if="contest_phase === 0" class="running-contest">
      <div v-if="user_data !== null">
        <b-container>
          <UserNav
            :userData="user_data"
            :HH="left_h"
            :MM="left_m"
            :SS="left_s"
            :contest_settings="contest_settings"
          />
        </b-container>
        <b-alert
          v-model="time_updated_alert"
          variant="info"
          dismissible
          class="alert"
        >Contest time updated! New end time: {{contest_settings.endTime}} {{contest_settings.endDate}}</b-alert>
      </div>
      <div v-if="problem_index === null">
        <div v-if="all_problems !== null">
          <b-row style="margin-top: 40px;">
            <b-col cols="6" offset="3">
              <AllProblems
                :problems="all_problems"
                :user_data="user_data"
                :contest_settings="contest_settings"
                @clicked="getSelectedProblemIndex"
              />
            </b-col>
          </b-row>
        </div>
        <div v-else>
          Loading problems...
          <b-spinner variant="primary"></b-spinner>
        </div>
      </div>
      <div v-else>
        <div class="problem-tabs-container">
          <b-badge class="problem-badge" @click="openAllProblems">All problems</b-badge>
          <b-badge
            :class="problemSwitchClass(index)"
            @click="openProblemByIndex(index)"
            v-for="(problem, index) in all_problems"
            :key="index"
          >Q{{index + 1}}. {{problem.name}}</b-badge>
        </div>
        <div class="problem-container">
          <b-row class="question-title">
            <b-col>
              <center>
                <h2>{{all_problems[problem_index].name}}</h2>
                Time limit: {{all_problems[problem_index].timeLimit}} sec
                <br />
                Maximum points: {{all_problems[problem_index].points}}
                <br />
                Current points: {{user_current_ques_points ? user_current_ques_points : "updating..."}}
                <br />
                Problem Setter: {{all_problems[problem_index].problemSetter}}
              </center>
            </b-col>
          </b-row>
          <b-form-checkbox v-model="is_split_view" switch size="lg" style="margin-bottom: 20px;">
            <span v-if="is_split_view">Toggle to normal view</span>
            <span v-else>Toggle to split view</span>
          </b-form-checkbox>
          <p
            class="toggle-message"
            v-if="is_split_view"
          >*Note: Switch to normal view if code formatting is not correct in split view.</p>
          <b-row>
            <b-col :cols="is_split_view? 5: 12">
              <h4>Problem Statement</h4>
              <p class="question-segment" v-html="all_problems[problem_index].description"></p>
              <h4>Input Format</h4>
              <p class="question-segment" v-html="all_problems[problem_index].inputFormat"></p>
              <h4>Output Format</h4>
              <p class="question-segment" v-html="all_problems[problem_index].outputFormat"></p>
              <h4>Constraints</h4>
              <p class="question-segment" v-html="all_problems[problem_index].constraints"></p>
              <h4>Sample Input</h4>
              <p class="question-segment" v-html="all_problems[problem_index].sampleInput"></p>
              <h4>Sample Output</h4>
              <p class="question-segment" v-html="all_problems[problem_index].sampleOutput"></p>
            </b-col>
            <b-col>
              <h4>Code</h4>
              ({{all_problems[problem_index].language}})
              <canvas
                id="cv"
                :height="canvas_height"
                :width="canvas_width"
              ></canvas>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="hint-container" v-if="is_current_hint_taken !== null">
                <!-- Remove the below div if don't want to change the ranklist.  -->

                <!-- <div v-if="!is_current_hint_taken && is_hint_left && !is_ques_solved">
                  <b-button
                    v-b-toggle.collapse-hint
                    variant="outline-warning"
                  >Got stuck? Want to take a hint?</b-button>
                  <b-collapse id="collapse-hint" class="mt-2">
                    <b-card>
                      <p
                        class="card-text"
                      >Are you sure? After taking hint, the current score for this question {{user_current_ques_points}} will be decreased to {{parseInt(user_current_ques_points * 0.5)}}.</p>
                      <b-button
                        variant="danger"
                        @click="takeHint()"
                        :disabled="is_hint_button_pressed"
                      >Yes, Take hint</b-button>
                      <b-button
                        v-b-toggle.collapse-hint
                        variant="success"
                        style="margin-left: 20px;"
                      >No, don't take hint</b-button>
                    </b-card>
                  </b-collapse>
                </div> -->

                <!-- ---------------------------------------------------------  -->

                <!-- Only show the below div if don't want to change the ranklist. -->

                <!-- <div v-if="is_current_hint_taken"> -->
                  <p class="h6 mb-2">
                    <b-alert variant="warning" show>
                      <b-icon icon="alert-circle-fill" variant="warning"></b-icon>
                      Hint: {{all_problems[problem_index].hint}}
                    </b-alert>
                  </p>
                <!-- </div> -->
                <!-- <div v-else-if="is_ques_solved"> -->
                  <!-- Already solved! Hint hidden. -->
                <!-- </div> -->
                <!-- <div v-if="!is_current_hint_taken && !is_hint_left && !is_ques_solved">No more hints left!</div> -->
              </div>
              <div v-else>
                <b-spinner variant="primary"></b-spinner>
              </div>

              Current scorable points: {{user_current_ques_points}}
            </b-col>
          </b-row>
          <hr />
          <span class="submit-instructions">
            <li>Instructions before submit:</li>
            <ol>
              <li>The input file should be strictly in .txt extension.</li>
              <li>The input file should strictly follow the Input Format and Constraints as specified in the problem.</li>
              <li>The last line of input file should end with a newline. i.e. an extra blank line at the end.</li>
              <li>Not following point 2 and 3 will lead to incorrect input format, however the current score for this problem will NOT be reduced.</li>
              <li>For each unsuccessful hacking attempt, the current score for this problem will decrease by the factor of {{contest_settings.pointReductionConstant}}.</li>
              <li>If hint is taken, the current score for this problem will be halved.</li>
            </ol>
          </span>
          <center>
            <input type="file" ref="fileInput" @change="selectedFileInput" />
          </center>
          <center style="margin-top: 10px;">
            <b-button variant="outline-primary" @click="hackIt()" :disabled="submitted">
              <span v-if="submitted">Please wait...</span>
              <span v-else>Hack it!</span>
            </b-button>
          </center>
          <div class="submit-status">
            <center>
              <strong>
                <p :class="input_format_class">{{submit_status}}</p>
                <h3 :class="hack_class">{{hack_status}}</h3>
              </strong>
              <span v-if="submitted">
                <b-spinner variant="warning" label="Spinning"></b-spinner>
              </span>
            </center>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <b-spinner variant="primary"></b-spinner>
    </div>
  </div>
</template>

<script>
import Header from './Header';
import UserNav from '../components/UserNav';
import AllProblems from '../components/AllProblems';
import router from '../router';
import { mapActions } from 'vuex';
import axios from 'axios';


export default {
  data() {
    return {
      page_loaded: false,
      id: null,
      contest_settings: null,
      currDateTime: null,
      left_h: null,
      left_m: null,
      left_s: null,
      contest_phase: null, // -1 => before contest, 0 => contest running, 1 => contest ended
      all_problems: null,
      user_data: null,
      problem_index: null,
      time_updated_alert: false,
      canvas_height: 3000,
      canvas_width: 600,
      is_split_view: true,
      input_file: '',
      submitted: false,
      submit_status: '',
      submit_status_code: -1,
      input_format_class: '',
      hack_status: '',
      hack_class: '',
      is_current_hint_taken: false,
      is_hint_left: false,
      user_current_ques_points: null,
      is_hint_button_pressed: false,
      is_ques_solved: false,
      submission: {
        username: null,
        qID: null,
        submittedAt: null,
        testcase: null,
        isCorrectFormat: null,
        maxPoint: null,
        scoredPoint: null,
        reductionConstant: null
      }
    }
  },
  components: {
    Header,
    UserNav,
    AllProblems
  },
  methods: {
    ...mapActions(['updateUserSession']),
    formatDate(date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;

      return [year, month, day].join('-');
    },
    formatTime24H(date) {
      var d = new Date(date);
      var hours = '' + d.getHours();
      var minutes = '' + d.getMinutes();
      if (hours.length < 2)
        hours = '0' + hours
      if (minutes.length < 2)
        minutes = '0' + minutes
      var t = [hours, minutes].join(':');
      return t;
    },
    getDateTimeDifference(DateA, DateB) {
      const date1 = new Date(DateA);
      const date2 = new Date(DateB);
      const diffTime = Math.abs(date2 - date1);
      var diff_in_s = Math.ceil(diffTime / (1000));
      var diff_in_m = parseInt(diff_in_s / 60);
      var diff_in_h = parseInt(diff_in_s / (60 * 60));
      diff_in_m -= diff_in_h * 60;
      diff_in_s -= (diff_in_h * 60 * 60 + diff_in_m * 60);
      return [diff_in_h, diff_in_m, diff_in_s];
    },
    dateTimeCompareLt(DateA, DateB) {
      var date1 = new Date(DateA);
      var date2 = new Date(DateB);
      return (date2 - date1) > 0;
    },
    async getContestSettings() {
      await axios.get('/api/contest/settings')
        .then((res) => {
          this.contest_settings = res.data;
          this.contest_settings.startDate = this.formatDate(this.contest_settings.startDateTime);
          this.contest_settings.startTime = this.formatTime24H(this.contest_settings.startDateTime);
          this.contest_settings.endDate = this.formatDate(this.contest_settings.endDateTime);
          this.contest_settings.endTime = this.formatTime24H(this.contest_settings.endDateTime);
        })
    },
    async syncContestTimeSettings() {
      this.currDateTime = new Date();
      const cmp_st = this.dateTimeCompareLt(this.currDateTime, this.contest_settings.startDateTime);
      const cmp_en = this.dateTimeCompareLt(this.currDateTime, this.contest_settings.endDateTime);
      if (cmp_st) {
        this.contest_phase = -1;
        this.all_problems = null;
        [this.left_h, this.left_m, this.left_s] = this.getDateTimeDifference(this.currDateTime, this.contest_settings.startDateTime);
      }
      else if (!cmp_en) {
        this.contest_phase = 1;
        this.all_problems = null;
        this.left_h = this.left_m = this.left_s = null;
      } else {
        this.contest_phase = 0;
        [this.left_h, this.left_m, this.left_s] = this.getDateTimeDifference(this.currDateTime, this.contest_settings.endDateTime);
        if (this.all_problems === null) {
          await axios.get('/api/contest/all-problems')
            .then((res) => {
              this.all_problems = res.data;
            })
        }
      }
    },
    async ifUpdateContestTime() {
      await axios.get('/api/contest/settings')
        .then((res) => {
          const new_end_date = this.formatDate(res.data.endDateTime);
          const new_end_time = this.formatTime24H(res.data.endDateTime);
          const new_start_date = this.formatDate(res.data.startDateTime);
          const new_start_time = this.formatTime24H(res.data.startDateTime);
          const new_max_hints = res.data.maxHints;
          const new_K = res.data.pointReductionConstant;
          if (this.contest_settings.endDate !== new_end_date
            || this.contest_settings.endTime !== new_end_time
            || this.contest_settings.startDate !== new_start_date
            || this.contest_settings.startTime !== new_start_time
            || this.contest_settings.maxHints !== new_max_hints
            || this.contest_settings.pointReductionConstant !== new_K) {
            if (this.contest_settings.endDate !== new_end_date
              || this.contest_settings.endTime !== new_end_time)
              this.time_updated_alert = true;
            this.contest_settings = res.data;
            this.contest_settings.startDate = new_start_date;
            this.contest_settings.startTime = new_end_date;
            this.contest_settings.endDate = new_end_date;
            this.contest_settings.endTime = new_end_time;
          }
        })
    },
    async getUserData() {
      await axios.get('/api/auth/user-data')
        .then((res) => {
          this.user_data = res.data;
        })
    },
    async updateHintStatus() {
      var no_of_hints_taken = 0;
      this.is_current_hint_taken = false;
      this.is_hint_left = false;
      this.user_data.quesAttempts.forEach(quesAttempt => {
        if (quesAttempt.hasHintTaken)
          no_of_hints_taken++;
        if ((quesAttempt.qID === this.all_problems[this.problem_index].qID) && quesAttempt.hasHintTaken)
          this.is_current_hint_taken = true;
      });
      this.is_hint_left = (no_of_hints_taken < this.contest_settings.maxHints);
    },
    async updateUserCurrentQuesPoints() {
      this.user_current_ques_points = parseInt(this.all_problems[this.problem_index].points);
      this.user_data.quesAttempts.forEach(quesAttempt => {
        if (quesAttempt.qID === this.all_problems[this.problem_index].qID) {
          if (quesAttempt.hasSolved)
            this.is_ques_solved = true;
          for (var i = 0; i < quesAttempt.wrongAttemptsCount; i++) {
            this.user_current_ques_points = parseInt(this.user_current_ques_points * this.contest_settings.pointReductionConstant);
          }
          if (quesAttempt.hasHintTaken)
            this.user_current_ques_points = parseInt(this.user_current_ques_points * 0.5);
        }
      });
      this.user_current_ques_points = Math.max(this.user_current_ques_points, 1);
    },
    async getSelectedProblemIndex(value) {
      await this.openProblemByIndex(value);
    },
    problemSwitchClass(index) {
      var badge_class = "problem-badge";
      this.user_data.quesAttempts.forEach(quesAttempt => {
        if ((quesAttempt.qID === this.all_problems[index].qID) && quesAttempt.hasSolved) {
          badge_class = "problem-hacked-badge";
        }
      });
      return badge_class;
    },
    async openAllProblems() {
      this.problem_index = null;
    },
    async openProblemByIndex(index, sustain_submit_status = false) {
      this.is_hint_button_pressed = false;
      this.is_ques_solved = false;
      this.user_current_ques_points = null;
      this.problem_index = index;
      this.is_current_hint_taken = this.is_hint_left = null;
      if (!sustain_submit_status)
        await this.resetSubmitStatusAndValues();
      await this.checkAndAddNewQuesAttemptToUserData();
      await this.updateHintStatus();
      await this.updateUserCurrentQuesPoints();
    },
    async takeHint() {
      this.is_hint_button_pressed = true;
      for (var i = 0; i < this.user_data.quesAttempts.length; i++) {
        if (this.user_data.quesAttempts[i].qID === this.all_problems[this.problem_index].qID) {
          this.user_data.quesAttempts[i].hasHintTaken = true;
          break;
        }
      }
      await axios.post('/api/contest/update-user-data', this.user_data);
      await this.openProblemByIndex(this.problem_index);
    },
    drawCanvas() {
      if (this.problem_index === null)
        return;
      const cv = document.getElementById('cv')
      const ctx = cv.getContext('2d')
      ctx.clearRect(0, 0, 1100, 3000)
      ctx.font = 12 + 'px' + ' ' + 'Courier New'
      ctx.fillStyle = "black";
      ctx.textAlign = 'left'
      ctx.save()
      var line = '';
      this.canvas_width = (this.is_split_view ? 600 : 1100);
      var maxWidth = this.canvas_width;
      var x = 0, y = 25;
      var lineHeight = 25;
      var lines = this.all_problems[this.problem_index].incorrectSolution.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(' ');
        for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = '';
      }
      ctx.fillText(line, x, y);
      this.canvas_height = y + 20;
      ctx.restore()
    },
    emitDataURL: function () {
      if (!this.problem_index)
        return;
      const dataURL = document.getElementById('cv').toDataURL('image/png')
      this.$emit('updated', dataURL)
    },
    async selectedFileInput() {
      let file = this.$refs.fileInput.files[0];
      if (!file || file.type !== 'text/plain') return;

      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = evt => {
        this.inputFile = evt.target.result;
      }
    },
    async checkInputFormat(callback) {
      const check_format_body = {
        source_code: this.all_problems[this.problem_index].checkerProgram,
        language_id: "10",
        stdin: this.inputFile
      };
      await axios.post('/api/normal/judge0-sumbit', check_format_body)
        .then((res) => {
          const status = res.data.stderr;
          if (status === 'SUCCESS\n') {
            this.submit_status_code = 200;
          } else {
            this.submit_status_code = 404;
          }
          callback();
        })
        .catch(() => {
          this.submit_status_code = 500;
          callback();
        })
    },
    async getHackStatus() {
      var correct_stdout = '', incorrect_stdout = '';
      const correct_solution = {
        source_code: this.all_problems[this.problem_index].correctSolution,
        language_id: this.all_problems[this.problem_index].languageCode,
        stdin: this.inputFile
      };
      const incorrect_solution = {
        source_code: this.all_problems[this.problem_index].incorrectSolution,
        language_id: this.all_problems[this.problem_index].languageCode,
        stdin: this.inputFile
      };
      await axios.post('/api/normal/judge0-sumbit', correct_solution)
        .then((res) => {
          correct_stdout = res.data.stdout;
        })
      await axios.post('/api/normal/judge0-sumbit', incorrect_solution)
        .then((res) => {
          incorrect_stdout = res.data.stdout;
        })
      if (correct_stdout !== incorrect_stdout) {
        this.hack_status = "Successful hacking";
        this.hack_class = "success-hack";
        return true;
      } else {
        this.hack_status = "Unsuccessful hacking";
        this.hack_class = "fail-hack";
        return false;
      }
    },
    async resetSubmitStatusAndValues() {
      this.submit_status = '';
      this.submit_status_code = -1;
      this.hack_status = '';
      this.hack_class = '';
      this.input_format_class = '';
    },
    resetSubmissionDetails() {
      this.submission.username = null;
      this.submission.qID = null;
      this.submission.submittedAt = null;
      this.submission.testcase = null;
      this.submission.isCorrectFormat = null;
      this.submission.maxPoint = null;
      this.submission.scoredPoint = null;
      this.submission.reductionConstant = null;
    },
    async checkAndAddNewQuesAttemptToUserData() {
      var already_present = false;
      for (var i = 0; i < this.user_data.quesAttempts.length; i++) {
        if (this.user_data.quesAttempts[i].qID === this.all_problems[this.problem_index].qID) {
          already_present = true;
          break;
        }
      }
      if (!already_present) {
        this.user_data.quesAttempts.push({
          qID: this.all_problems[this.problem_index].qID,
          hasSolved: false,
          wrongAttemptsCount: 0,
          hasHintTaken: 0
        });
      }
      await axios.post('/api/contest/update-user-data', this.user_data);
    },
    async getSubmissionScoredPoint() {
      var curr_points = parseInt(this.all_problems[this.problem_index].points);
      for (var i = 0; i < this.user_data.quesAttempts.length; i++) {
        if (this.user_data.quesAttempts[i].qID === this.all_problems[this.problem_index].qID) {
          for (var j = 0; j < this.user_data.quesAttempts[i].wrongAttemptsCount; j++) {
            curr_points = parseInt(curr_points * this.contest_settings.pointReductionConstant);
          }
          if (this.user_data.quesAttempts[i].hasHintTaken)
            curr_points = parseInt(curr_points * 0.5);
          break;
        }
      }
      curr_points = Math.max(curr_points, 1);
      return curr_points;
    },
    async updateAfterHackResults(is_hacked) {
      for (var i = 0; i < this.user_data.quesAttempts.length; i++) {
        if (this.user_data.quesAttempts[i].qID === this.all_problems[this.problem_index].qID) {
          if (!this.user_data.quesAttempts[i].hasSolved) {
            if (is_hacked === true) {
              this.user_data.quesAttempts[i].hasSolved = true;
              this.submission.scoredPoint = await this.getSubmissionScoredPoint();

              /** Remove the below three lines if don't want to change the ranklist. */

              // this.user_data.totalScore += this.submission.scoredPoint;
              // const contest_start_time = new Date(this.contest_settings.startDateTime);
              // this.user_data.totalPenalty += parseInt((this.submission.submittedAt.getTime() -
              //   contest_start_time.getTime()) / 1000);

              /**--------------------------------------------------------- */

            } else if (is_hacked === false) {

              /** Remove the below line if don't want to change the ranklist. */

              // this.user_data.quesAttempts[i].wrongAttemptsCount++;

              /**--------------------------------------------------------- */

            } // else is_hacked === null  i.e incorrect input format
          }
          break;
        }
      }

      /** Remove the below line if don't want to change the ranklist. */

      // await axios.post('/api/contest/update-user-data', this.user_data);

      /**--------------------------------------------------------- */

      /** Not storing submissions in the database for now
       * Heroku db: limit 50MB
       */

      // await axios.post('/api/contest/add-submission', this.submission);

      /**--------------------------------------------------------- */

      await this.openProblemByIndex(this.problem_index, true);
    },
    async hackIt() {
      if (this.submitted) return;
      this.submitted = true;

      this.submission.username = this.user_data.username;
      this.submission.qID = this.all_problems[this.problem_index].qID;
      this.submission.submittedAt = new Date();
      this.submission.testcase = this.inputFile;
      this.submission.maxPoint = parseInt(this.all_problems[this.problem_index].points);
      this.submission.reductionConstant = parseFloat(this.contest_settings.pointReductionConstant);

      await this.resetSubmitStatusAndValues();

      await this.checkInputFormat(async () => {
        var is_hacked = null;
        if (this.submit_status_code === 500) {
          this.submit_status = "Something went wrong with the server.";
        } else if (this.submit_status_code === 404) {
          this.submit_status = "Incorrect input format.";
          this.input_format_class = "incorrect-input-format";
          this.submission.isCorrectFormat = false;
        } else if (this.submit_status_code === 200) {
          this.submit_status = "Correct input format.";
          this.input_format_class = "correct-input-format";
          this.submission.isCorrectFormat = true;
          is_hacked = await this.getHackStatus();
        }
        this.submitted = false;
        this.inputFile = '';
        this.$refs.fileInput.value = '';

        /** Remove the below line if don't want to change the ranklist. */

        // await this.updateAfterHackResults(is_hacked);

        /**------------------------------------------------------------ */

        /** Add the below line if don't want to change the ranklist. */
        
        return is_hacked;

        /**------------------------------------------------------------ */

      });
    }
  },
  async mounted() {
    try {
      await this.updateUserSession();
      this.id = this.$store.state.user._id;
      this.page_loaded = true;
      if (this.id) {
        await this.getContestSettings();
        setInterval(this.syncContestTimeSettings, 1000);
        await this.getUserData();
        setInterval(this.ifUpdateContestTime, 30000);
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    }
  },
  updated() {
    this.drawCanvas()
    this.emitDataURL()
  },
  watch: {
    is_split_view: {
      handler: function () {
        this.drawCanvas()
        this.emitDataURL()
      },
      deep: true
    }
  }
}
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
.alert {
  margin-top: 10px;
  padding-top: 15px;
  height: 50px;
}
.toggle-message {
  margin-top: -20px;
  margin-left: 15px;
  font-size: 11px;
  color: rgb(180, 0, 0);
  font-weight: bold;
}
.problem-tabs-container {
  padding-left: 30px;
  padding-top: 10px;
}
.problem-hacked-badge {
  margin-right: 20px;
  margin-bottom: 10px;
  background: green;
  cursor: pointer;
}
.problem-badge {
  margin-right: 20px;
  margin-bottom: 10px;
  background: rgba(56, 56, 56, 0.883);
  cursor: pointer;
}
.problem-container {
  white-space: pre-wrap;
  margin-top: 10px;
  margin-left: 50px;
}
.question-title {
  margin-bottom: 10px;
}
.submit-instructions li {
  font-weight: bold;
  font-size: 11px;
}
.submit-status {
  margin-top: 20px;
  font-size: 20px;
}
.success-hack {
  color: green;
  font-weight: bold;
}
.fail-hack {
  color: rgb(255, 60, 60);
  font-weight: bold;
}
.correct-input-format {
  color: green;
  font-weight: bold;
}
.incorrect-input-format {
  color: red;
  font-weight: bold;
}
</style>
