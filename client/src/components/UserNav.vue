<template>
  <div>
    <b-nav style="margin-left: 30px;">
      <span class="user-nav">User: {{userData.name}} ({{userData.username}})</span>
      <span class="user-nav">
        Time left:
        <span>
          <strong>{{HH}}:{{MM}}:{{SS}}</strong>
        </span>
      </span>
      <span class="user-nav">Your score: {{userData.totalScore}}</span>
      <span class="user-nav">Hints taken: {{hints_taken}} / {{contest_settings.maxHints}}</span>
    </b-nav>
  </div>
</template>

<script>
export default {
  props: ['userData', 'contest_settings', 'HH', 'MM', 'SS'],
  data() {
    return {
      hints_taken: null,
    }
  },
  methods: {
    updateHints() {
      this.hints_taken = 0;
      this.userData.quesAttempts.forEach(quesAttempt => {
        if (quesAttempt.hasHintTaken)
          this.hints_taken++;
      });    }
  },
  mounted() {
    this.updateHints();
  },
  watch: {
    userData: {
      handler() {
        this.updateHints();
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.user-nav {
  font-size: 12px;
  margin-right: 50px;
}
</style>
