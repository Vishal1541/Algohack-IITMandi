<template>
  <div class="container">
    <center>
      <h3>Problems</h3>
    </center>
    <b-table :items="table_entries" :fields="fields">
      <template v-slot:cell(No)="data">
        <span @click="openProblem(data.index)" class="problem-link">{{data.index + 1}}</span>
      </template>
      <template v-slot:cell(Question)="data">
        <span @click="openProblem(data.index)" class="problem-link">
          {{data.item.name}}
          <b-icon
            icon="alert-circle-fill"
            variant="warning"
            v-if="data.item.hint_taken"
            v-b-popover.hover.top="'Hint taken for this question'"
          ></b-icon>
          <b-badge variant="success" v-if="data.item.has_solved">Hacked</b-badge>
        </span>
      </template>
      <template v-slot:cell(MaxPoints)="data">{{data.item.points}}</template>
      <template v-slot:cell(CurrentPoints)="data">
        <span :class="currentPointsClass(data.item.has_solved)">{{data.item.currentPoints}}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  props: ['problems', 'user_data', 'contest_settings'],
  data() {
    return {
      fields: ['No', 'Question', 'CurrentPoints', 'MaxPoints'],
      table_entries: []
    }
  },
  methods: {
    openProblem(i) {
      this.$emit('clicked', i);
    },
    getCurrentPointIsSolvedHintTaken(idx) {
      var curr_points = parseInt(this.problems[idx].points);
      var has_solved = false;
      var hint_taken = false;
      this.user_data.quesAttempts.forEach(quesAttempt => {
        if (quesAttempt.qID === this.problems[idx].qID) {
          has_solved = quesAttempt.hasSolved;
          for (var i = 0; i < quesAttempt.wrongAttemptsCount; i++) {
            curr_points = parseInt(curr_points * this.contest_settings.pointReductionConstant);
          }
          if (quesAttempt.hasHintTaken)
            curr_points = parseInt(curr_points * 0.5);
          if (quesAttempt.hasHintTaken)
            hint_taken = true;
        }
      });
      curr_points = Math.max(curr_points, 1);
      return [curr_points, has_solved, hint_taken];
    },
    currentPointsClass(has_solved) {
      if (has_solved)
        return "solved";
      return "not-solved";
    }
  },
  mounted() {
    this.table_entries = this.problems;
    for (var i = 0; i < this.problems.length; i++) {
      this.table_entries[i].index = i;
      [this.table_entries[i].currentPoints,
      this.table_entries[i].has_solved,
      this.table_entries[i].hint_taken] = this.getCurrentPointIsSolvedHintTaken(i);
    }
  }
}
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
