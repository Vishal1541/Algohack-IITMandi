<template>
  <div v-if="page_loaded">
    <div v-if="verified">
      Roll number
      <strong>{{$route.params.rollno}}</strong> has been verified. Now you can
      <a href="/login">login</a>.
    </div>
    <div v-if="error_message.length">{{error_message}}</div>
  </div>
  <div v-else><b-spinner variant="primary"></b-spinner></div>
</template>

<script>
import axios from 'axios';
import router from '../router';

export default {
  name: 'Verify',
  data() {
    return {
      page_loaded: false,
      verified: false,
      error_message: ''
    }
  },
  async mounted() {
    try {
      const roll_no = this.$route.params.rollno;
      const token = this.$route.params.token;
      const verificationUri = encodeURIComponent(`verify&rollno=${roll_no}&token=${token}`);
      await axios.post(`/api/auth/email-verify&${verificationUri}`)
        .then((res) => {
          if (res.data === 'success') {
            this.verified = true;
          } else {
            this.error_message = res.data;
          }
        })
        .catch(() => {
        })
      this.page_loaded = true;
    } catch (err) {
      router.push('/');
    }
  }
}
</script>
