<template>
  <div>
    <Header />
    <div>
      <h3>The platform</h3>
      <p>
        AlgoHack is a platform to host algorithm hacking contests. Competitive coding is not only about solving problems but
        also to have a good debugging skills and given a problem and a code how quick to find some corner edge cases which fails the solution.
        In
        <a
          href="https://codeforces.com/profile/kingofnumbers"
          class="red-coder"
          target="_blank"
        >
          <b>kingofnumbers</b>
        </a> words
        <b>
          hacking is to give a testcase that makes a solution
          to a participant fail(i.e Wrong Answer,runtime error, time limit exceeded)
        </b>
      </p>
      <h3>Read these intructions carefully</h3>
      <ul>
        <li>
          Each probem is given with a code (C++ or Python) and has some initial points. It is guaranteed that the code compiles without any warning or error.
        </li>
        <li>It is also guaranteed that the code fails for at least one testcase.</li>
        <li>
          A hint is also provided with each problem. You can avail total
          <b>{{contest_settings.maxHints}}</b> of them during the contest but then the current
          score for the problem will be halved rounded
          <b>DOWNWARDS</b> to the nearest integer.
        </li>
        <li>
          The lowest point a problem can be downgraded to is
          <b>1</b>. After that any number of unsuccessful attempt won't change its point.
        </li>
        <li>Before submitting a testcase:</li>
        <ol>
          <li>
            The input file should be strictly in
            <b>.txt</b> extension.
          </li>
          <li>The input file should strictly follow the Input Format and Constraints as specified in the problem.</li>
          <li>
            The last line of input file should
            <b>end with a newline</b>. i.e. an extra blank line at the end.
          </li>
          <li>
            Not following point 2 and 3 will lead to incorrect input format, however the current score for the problem will
            <b>NOT</b> be reduced.
          </li>
          <li>
            For each unsuccessful hacking attempt, the current score for the problem will decrease by the factor of
            <b>{{contest_settings.pointReductionConstant}}</b> rounded
            <b>DOWNWARDS</b> to the nearest integer.
          </li>
        </ol>
        <li>After a successful hack:</li>
        <ol>
          <li>
            The penalty for that problem (the difference of the contest start time from that submission time in seconds)
            will be added to the participant's total penalty. This is used as a tie breaker if multiple participants have same total score.
          </li>
          <li>The hint for that problem will be hidden.</li>
          <li>Successive hacking submissions won't change its points.</li>
        </ol>
      </ul>
    </div>
  </div>
</template>

<script>
import Header from "../views/Header.vue";
import axios from 'axios';

export default {
  components: {
    Header
  },
  data() {
    return {
      contest_settings: {
        maxHints: null,
        pointReductionConstant: null
      }
    }
  },
  async mounted() {
    await axios.get('/api/normal/contest-settings')
      .then((res) => {
        this.contest_settings = res.data;
      })
  }
}

</script>

<style scoped>
.red-coder {
  color: red;
}
</style>
