<template>
  <div>
    <Header />
    <UserNav />

    <div v-if="is_page_loading">
      <b-spinner variant="primary"></b-spinner>
    </div>
    <div v-else>
      <!-- ------------------------ -->
      <!-- Problems tab begins here -->
      <!-- ------------------------ -->
      <div class="problem-tabs-container" v-if="!is_problems_tab_loading">
        <b-badge class="problem-badge" @click="openAllProblems"
          >All problems</b-badge
        >
        <b-badge
          :class="getProblemsTabClass(i)"
          @click="openProblemByIndex(i)"
          v-for="(p, i) in problems_tab"
          :key="i"
          >Q{{ i + 1 }}. {{ p.name }}</b-badge
        >
      </div>

      <!-- ------------------------ -->
      <!-- Problems tab ends here -->
      <!-- ------------------------ -->

      <!-- --------------------------- -->
      <!-- Problem section begins here -->
      <!-- --------------------------- -->

      <div class="problem-container">
        <!-- Problem description begins here -->

        <b-row class="question-title">
          <b-col>
            <center>
              <h2>{{ problem.name }}</h2>
              Time limit: {{ problem.timeLimit }} sec
              <br />
              Maximum points: {{ problem.points }}
              <br />
              Current points:
              <span v-if="null === user_problem_info.currentPoints">
                <b-spinner variant="primary"></b-spinner>
              </span>
              <span v-else>
                {{ user_problem_info.currentPoints }}
              </span>
              <br />
              Problem Setter: {{ problem.problemSetter }}
            </center>
          </b-col>
        </b-row>
        <b-form-checkbox
          v-model="is_split_view"
          switch
          size="lg"
          style="margin-bottom: 20px"
        >
          <span v-if="is_split_view">Toggle to normal view</span>
          <span v-else>Toggle to split view</span>
        </b-form-checkbox>
        <p class="toggle-message" v-if="is_split_view">
          *Note: Switch to normal view if code formatting is not correct in
          split view.
        </p>
        <b-row>
          <b-col :cols="is_split_view ? 5 : 12">
            <h4>Problem Statement</h4>
            <p class="question-segment" v-html="problem.description"></p>
            <h4>Input Format</h4>
            <p class="question-segment" v-html="problem.inputFormat"></p>
            <h4>Output Format</h4>
            <p class="question-segment" v-html="problem.outputFormat"></p>
            <h4>Constraints</h4>
            <p class="question-segment" v-html="problem.constraints"></p>
            <h4>Sample Input</h4>
            <p class="question-segment" v-html="problem.sampleInput"></p>
            <h4>Sample Output</h4>
            <p class="question-segment" v-html="problem.sampleOutput"></p>
          </b-col>
          <b-col>
            <h4>Code</h4>
            ({{ problem.language }})
            <canvas
              id="cv"
              :height="canvas_height"
              :width="canvas_width"
            ></canvas>
          </b-col>
        </b-row>

        <!-- Problem description ends here -->

        <!-- Hint row begins here -->

        <b-row>
          <b-col>
            <div
              class="hint-container"
              v-if="null !== user_problem_info.hasHintTaken"
            >
              <div
                v-if="
                  !user_problem_info.hasHintTaken &&
                  user_problem_info.totalHintsLeft > 0 &&
                  !user_problem_info.hasSolved
                "
              >
                <b-button v-b-toggle.collapse-hint variant="outline-warning"
                  >Got stuck? Want to take a hint?</b-button
                >
                <b-collapse id="collapse-hint" class="mt-2">
                  <b-card>
                    <p class="card-text">
                      Are you sure? After taking hint, your current score for
                      this question {{ user_problem_info.currentPoints }} will
                      be decreased to
                      {{
                        Math.max(
                          MIN_SCORABLE_POINTS_PER_QUES,
                          parseInt(
                            user_problem_info.currentPoints *
                              HINT_TAKEN_REDUCTION_FACTOR
                          )
                        )
                      }}.
                    </p>
                    <b-button
                      variant="danger"
                      @click="takeHint()"
                      :disabled="is_hint_button_pressed"
                      >Yes, Take hint</b-button
                    >
                    <b-button
                      v-b-toggle.collapse-hint
                      variant="success"
                      style="margin-left: 20px"
                      >No, don't take hint</b-button
                    >
                  </b-card>
                </b-collapse>
              </div>

              <div v-if="user_problem_info.hasHintTaken">
                <p class="h6 mb-2">
                  <b-alert variant="warning" show>
                    <b-icon icon="alert-circle-fill" variant="warning"></b-icon>
                    <span v-if="null === problem.hint">
                      <b-spinner variant="primary"></b-spinner>
                    </span>
                    <span v-else> Hint: {{ problem.hint }} </span>
                  </b-alert>
                </p>
              </div>
              <div v-else-if="user_problem_info.hasSolved">
                <!-- Already solved! Hint hidden. -->
              </div>
              <div
                v-if="
                  !user_problem_info.hasHintTaken &&
                  user_problem_info.totalHintsLeft <= 0 &&
                  !user_problem_info.hasSolved
                "
              >
                No more hints left!
              </div>
            </div>
            <div v-else>
              <b-spinner variant="primary"></b-spinner>
            </div>

            Current scorable points: {{ user_problem_info.currentPoints }}
          </b-col>
        </b-row>
        <b-row v-if="null === user_problem_info.hasHintTaken">
          <b-spinner variant="primary"></b-spinner>
        </b-row>

        <!-- Hint row ends here -->

        <!-- Problem Submission sub section begins here -->

        <hr />
        <span class="submit-instructions">
          <li>Instructions before submit:</li>
          <ol>
            <li>The input file should be strictly in .txt extension.</li>
            <li>
              The input file should strictly follow the Input Format and
              Constraints as specified in the problem.
            </li>
            <li>
              The last line of input file should end with a newline. i.e. an
              extra blank line at the end.
            </li>
            <li>
              Not following point 2 and 3 will lead to incorrect input format,
              however the current score for this problem will NOT be affected.
            </li>
            <li>
              For each unsuccessful hacking attempt, the current score for this
              problem will decrease by the factor of
              {{ contest_settings.pointReductionConstant }}.
            </li>
            <li>
              If hint is taken, the current score for this problem will be
              halved.
            </li>
          </ol>
        </span>
        <center>
          <input type="file" ref="fileInput" @change="selectedFileInput" />
        </center>
        <center style="margin-top: 10px">
          <b-button
            variant="outline-primary"
            @click="hackIt()"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Please wait...</span>
            <span v-else>Hack it!</span>
          </b-button>
        </center>
        <div class="submit-status">
          <center>
            <strong>
              <p :class="hacking_status.input_format_class">
                {{ hacking_status.input_format_status_msg }}
              </p>
              <h3 :class="hacking_status.hack_class">
                {{ hacking_status.hack_status_msg }}
              </h3>
            </strong>
            <span v-if="isSubmitting">
              <b-spinner variant="warning" label="Spinning"></b-spinner>
            </span>
          </center>
        </div>

        <!-- Problem Submission sub section ends here -->
      </div>

      <!-- --------------------------- -->
      <!-- Problem section ends here -->
      <!-- --------------------------- -->
    </div>
  </div>
</template>

<script>
import axios from "axios";
import router from "../router";
import { mapActions } from "vuex";
import UserNav from "../components/UserNav.vue";
import Header from "./Header.vue";

export default {
  name: "Problem",
  components: {
    Header,
    UserNav,
  },
  data() {
    return {
      HINT_TAKEN_REDUCTION_FACTOR: 0.5,
      MIN_SCORABLE_POINTS_PER_QUES: 1,
      is_hint_button_pressed: false,
      is_page_loading: true,
      is_problems_tab_loading: true,
      contest_settings: {
        startDateTime: null,
        endDateTime: null,
        maxHints: null,
        pointReductionConstant: null,
      },
      problem: null,
      problems_tab: [],
      inputFile: "",
      user_problem_info: {
        qID: null,
        hasSolved: null,
        wrongAttemptsCount: null,
        hasHintTaken: null,
        currentPoints: null,
        totalHintsLeft: null,
        totalHintsTaken: null,
      },
      is_split_view: true,
      canvas_height: 3000,
      canvas_width: 600,
      isSubmitting: false,
      hacking_status: {
        input_format_status_msg: "",
        input_format_status: "",
        input_format_class: "",
        hack_status_msg: "",
        hack_status: "",
        hack_class: "",
      },
      INPUT_FORMAT_STATUS_ENUM: {
        CORRECT_FORMAT: "CORRECT_FORMAT",
        INCORRECT_FORMAT: "INCORRECT_FORMAT",
      },
      HACK_STATUS_ENUM: {
        SUCCESS: "SUCCESS",
        UNSUCCESSFUL: "UNSUCCESSFUL",
      },
    };
  },
  methods: {
    openAllProblems() {
      router.push("/contest");
    },
    openProblemByIndex(i) {
      if (
        window.location.pathname !==
        "/contest/problem/" + this.problems_tab[i].qID
      ) {
        router.push("/contest/problem/" + this.problems_tab[i].qID);
      }
      location.reload();
    },
    getProblemsTabClass(i) {
      if (!this.problems_tab[i].hasSolved) {
        return "problem-badge";
      }
      return "problem-hacked-badge";
    },
    drawCanvas() {
      if (this.problem_index === null) return;
      const cv = document.getElementById("cv");
      const ctx = cv.getContext("2d");
      ctx.clearRect(0, 0, 1100, 3000);
      ctx.font = 12 + "px" + " " + "Courier New";
      ctx.fillStyle = "black";
      ctx.textAlign = "left";
      ctx.save();
      var line = "";
      this.canvas_width = this.is_split_view ? 600 : 1100;
      var maxWidth = this.canvas_width;
      var x = 0,
        y = 25;
      var lineHeight = 25;
      var lines = this.problem.incorrectSolution.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var words = lines[i].split(" ");
        for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + " ";
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = "";
      }
      ctx.fillText(line, x, y);
      this.canvas_height = y + 20;
      ctx.restore();
    },
    emitDataURL: function () {
      if (!this.problem_index) return;
      const dataURL = document.getElementById("cv").toDataURL("image/png");
      this.$emit("updated", dataURL);
    },
    async updateUserQuestionInfo() {
      this.user_problem_info = (
        await axios.get(
          `/api/v1/contest/fetch-user-problem-data-by-qID/${this.$route.params.qID}`
        )
      ).data;
    },
    async takeHint() {
      this.is_hint_button_pressed = true;
      await axios
        .get(`/api/v1/contest/get-hint-for-problem/${this.$route.params.qID}`)
        .then((hint) => {
          this.problem.hint = hint.data;
        });
      await this.updateUserQuestionInfo();
      this.is_hint_button_pressed = false;
    },
    async selectedFileInput() {
      let file = this.$refs.fileInput.files[0];
      if (!file || file.type !== "text/plain") return;

      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (evt) => {
        this.inputFile = evt.target.result;
      };
    },
    resetHackingStatuses() {
      this.hacking_status.input_format_status_msg = "";
      this.hacking_status.input_format_status = "";
      this.hacking_status.input_format_class = "";
      this.hacking_status.hack_status_msg = "";
      this.hacking_status.hack_status = "";
      this.hacking_status.hack_class = "";
    },
    updateInputFormatStatus() {
      if (
        this.hacking_status.input_format_status ===
        this.INPUT_FORMAT_STATUS_ENUM.CORRECT_FORMAT
      ) {
        this.hacking_status.input_format_status_msg = "Correct input format";
        this.hacking_status.input_format_class = "correct-input-format";
      } else {
        this.hacking_status.input_format_status_msg = "Incorrect input format";
        this.hacking_status.input_format_class = "incorrect-input-format";
      }
    },
    updateHackStatus() {
      if (this.hacking_status.hack_status === this.HACK_STATUS_ENUM.SUCCESS) {
        this.hacking_status.hack_status_msg = "Successful hacking";
        this.hacking_status.hack_class = "success-hack";
      } else {
        this.hacking_status.hack_status_msg = "Unsuccessful hacking";
        this.hacking_status.hack_class = "fail-hack";
      }
    },
    async hackIt() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;
      this.resetHackingStatuses();

      // Checking for input file format and updating the status message
      // and css.
      this.hacking_status.input_format_status = (
        await axios.post("/api/v1/contest/check-input-format-by-qID", {
          qID: this.$route.params.qID,
          inputFile: this.inputFile,
        })
      ).data;
      this.updateInputFormatStatus();

      // Make the submission if the input format is correct.
      if (
        this.hacking_status.input_format_status ===
        this.INPUT_FORMAT_STATUS_ENUM.CORRECT_FORMAT
      ) {
        this.hacking_status.hack_status = (
          await axios.post("/api/v1/contest/submit-problem", {
            qID: this.$route.params.qID,
            inputText: this.inputFile,
          })
        ).data;
        this.updateHackStatus();
      }

      this.isSubmitting = false;
      this.inputFile = "";
      this.$refs.fileInput.value = "";

      // Update the user's scores dynamically on this page
      // after making a hacking attempt.
      if (
        this.hacking_status.input_format_status ===
        this.INPUT_FORMAT_STATUS_ENUM.CORRECT_FORMAT
      ) {
        await this.updateUserQuestionInfo();
      }
    },
    ...mapActions(["updateUserSession"]),
  },
  async mounted() {
    await this.updateUserSession();
    this.id = this.$store.state.user._id;
    if (this.id === null) {
      router.push("/");
    } else {
      const qID = this.$route.params.qID;
      await axios
        .get(`/api/v1/contest/fetch-problem-by-qid/${qID}`)
        .then(async (res) => {
          this.problem = res.data;
          this.is_page_loading = false;
          this.problems_tab = (
            await axios.get("/api/v1/contest/fetch-problems-tab")
          ).data;
          this.is_problems_tab_loading = false;
          await axios.post(
            `/api/v1/contest/initialize-user-problem-data/${qID}`
          );
          await this.updateUserQuestionInfo();
          if (this.user_problem_info.hasHintTaken) {
            this.takeHint();
          }
          this.contest_settings = (
            await axios.get("/api/v1/contest/fetch-contest-settings")
          ).data;
        })
        .catch(() => {
          router.push("/");
        });
    }
  },
  updated() {
    this.drawCanvas();
    this.emitDataURL();
  },
  watch: {
    is_split_view: {
      handler: function () {
        this.drawCanvas();
        this.emitDataURL();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
/* Problems tabs CSS starts. */
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
/* ------------------------ */

/* Problem section CSS starts. */
.problem-container {
  white-space: pre-wrap;
  margin-top: 10px;
  margin-left: 50px;
}
.toggle-message {
  margin-top: -20px;
  margin-left: 15px;
  font-size: 11px;
  color: rgb(180, 0, 0);
  font-weight: bold;
}
.question-title {
  margin-bottom: 10px;
}
/* --------------------------- */

/* Submit section CSS starts. */
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
/* --------------------------- */
</style>