<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" />
        <InfiniteScroll :dataList="dataList">
            <template v-slot:item="{ item }">
                <img src="./assets/logo.png" style="height: 10px; width: 10px"/>
                <span class="value">{{ item.name }}</span>
            </template>
        </InfiniteScroll>
    </div>
</template>

<script>
import InfiniteScroll from "./components/InfiniteScroll.vue";

export default {
    name: "App",
    components: {
        InfiniteScroll,
    },
    data: function() {
        return {
            dataList: [],
        };
    },
    created: function() {
        for (let index = 0; index < 100; index++) {
            this.dataList.push({ name: index });
        }
    },
};
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
