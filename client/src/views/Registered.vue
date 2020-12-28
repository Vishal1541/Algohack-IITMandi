<template>
  <div>
    <Header />
    <b-col sm="6" offset="3">
      <div v-if="table_loaded">
        <center>
          <h3>Registered participants</h3>
        </center>
        <b-table :items="users" :fields="fields">
          <template v-slot:cell(name)="data">
            {{data.item.name}}
            <span v-if="data.item.username === 'b16040'" style="font-size: 11px;">(admin)</span>
          </template>
        </b-table>
      </div>
      <div v-else><b-spinner variant="primary"></b-spinner></div>
    </b-col>
  </div>
</template>

<script>
import Header from './Header';
import axios from 'axios';
import router from '../router';

export default {
  components: {
    Header
  },
  data() {
    return {
      table_loaded: false,
      users: [],
      fields: ['no', 'name', 'registeredAt']
    }
  },
  methods: {
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
    }
  },
  async mounted() {
    try {
      await axios.get('api/normal/registered')
        .then((res) => {
          this.users = res.data;
          for (var i = 0; i < this.users.length; i++) {
            const d = this.users[i].registeredAt;
            this.users[i].no = i + 1;
            this.users[i].registeredAt = this.formatTime24H(d) + ', ' + this.formatDate(d);
          }
          this.table_loaded = true;
        })
        .catch(() => {
        })
    } catch (error) {
      router.push("/");
    }
  }
}
</script>
