<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <el-s-table :data="tableData"
                :columns="columns"
                border
                fix-window>
    </el-s-table>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'



export default {
  name: 'App',
  components: {
    HelloWorld,
  },
  data() {
    return {
      tableData: [
        { id: 1 }
      ],
      columns: [
        {
          type: 'selection',
        },
        {
          prop: 'id',
          label: 'ID'
        }
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
