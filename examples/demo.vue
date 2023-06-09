<template>
  <div id="app">
    <p>select value:{{selectValue}}</p>
    <sphere-scroll
      style="box-shadow: 0 1px 6px rgb(0 0 0 / 20%); margin: auto"
      :dataList="dataList" 
      @selectChange="onSelectChange" 
      :viewHeight="300" 
      :itemHeight="35"
      :viewWidth="300"
      ref="sphereScroll"
    >
      <template v-slot:item="{ item }">
        <div class="listItem">
          {{ item }}
        </div>
      </template>
    </sphere-scroll>
  </div>
</template>

<script>
import sphereScroll from '../packages/index'

export default {
  name: "App",
  components: {
    sphereScroll
  },
  data: function () {
    return {
      dataList: [],
      selectValue: 0,
    };
  },
  created: function () {
    for (let index = 0; index < 50; index++) {
      this.dataList.push(index);
    }
  },
  mounted: function () {
    this.$refs.sphereScroll.setSeclectIndex(0);
  },
  methods: {
    onSelectChange(index) {
      this.selectValue = this.dataList[index];
    }
  }
};
</script>

<style>
html {
  width: 100vw;
}
body {
  width: 100%;
  margin: 0;
  overflow-x: hidden;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
.listItem {
  font-size: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
