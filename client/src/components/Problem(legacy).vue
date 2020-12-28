<template>
  <div>
    <div class="problem-tabs-container">
      <b-badge class="problem-badge" @click="openAllProblems">All problems</b-badge>
      <b-badge
        class="problem-badge"
        @click="openProblemByIndex(index)"
        v-for="(problem, index) in problems"
        :key="index"
      >Q{{index + 1}}. {{problem.name}}</b-badge>
    </div>
    <div class="problem-container">
      <b-row>
        <b-col>
          <h4>Problem Statement</h4>
          <p class="question-segment">{{problems[problem_index].description}}</p>
          <h4>Input Format</h4>
          <p class="question-segment">{{problems[problem_index].inputFormat}}</p>
          <h4>Output Format</h4>
          <p class="question-segment">{{problems[problem_index].outputFormat}}</p>
          <h4>Constraints</h4>
          <p class="question-segment">{{problems[problem_index].constraints}}</p>
          <h4>Sample Input</h4>
          <p class="question-segment">{{problems[problem_index].sampleInput}}</p>
          <h4>Sample Output</h4>
          <p class="question-segment">{{problems[problem_index].sampleOutput}}</p>
        </b-col>
        <b-col>
          <h4>Code</h4>
          <canvas id="cv" :height="canvas_height" width="600"></canvas>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
export default {
  props: ['problem_index', 'problems'],
  data() {
    return {
      problem_index_local: null,
      canvas_height: 300,
      is_code_showing: false
    }
  },
  methods: {
    openAllProblems() {
      this.$emit('clicked', null);
    },
    openProblemByIndex(index) {
      this.problem_index_local = index;
      this.$emit('clicked', index);
      this.draw();
      this.emitDataURL();
    },
    draw: function () {
      const cv = document.getElementById('cv')
      const ctx = cv.getContext('2d')
      ctx.clearRect(0, 0, 400, 300)
      ctx.font = 12 + 'px' + ' ' + 'Courier New'
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = 'left'
      ctx.save()
      var line = '';
      var maxWidth = 600;
      var x = 0, y = 25;
      var lineHeight = 25;
      var lines = this.problems[this.problem_index_local].incorrectSolution.split('\n');
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
      const dataURL = document.getElementById('cv').toDataURL('image/png')
      this.$emit('updated', dataURL)
    },
    showCode() {
      this.draw()
      this.emitDataURL()
    }
  },
  updated() {
    this.draw()
    this.emitDataURL()
  },
  mounted() {
    const dataURL = document.getElementById('cv').toDataURL('image/png')
    this.$emit('updated', dataURL)
  }
}
</script>

<style scoped>
.problem-tabs-container {
  padding-left: 30px;
  padding-top: 10px;
}
.problem-badge {
  margin-right: 20px;
  margin-bottom: 10px;
  background: rgba(56, 56, 56, 0.883);
  cursor: pointer;
}
.problem-container {
  margin-top: 10px;
}
</style>
