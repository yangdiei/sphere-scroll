<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" />
        <h1 class="gradient-text" data-v-fb6d3afe>
            111111111111111111111111111111111111111
        </h1>
        <p>{{selectValue}}</p>
        <sphere-scroll :dataList="dataList" @selectChange="onSelectChange">
            <template v-slot:item="{ item }">
                <div class="ListItem">
                    <img
                        src="./assets/logo.png"
                        style="height: 10px; width: 10px"
                    />
                    <span class="value">{{ item.name }}</span>
                </div>
            </template>
        </sphere-scroll>
    </div>
</template>

<script>
// import InfiniteScroll from "./components/InfiniteScroll.vue";
import SphereScroll from "./components/sphereScroll.vue";

export default {
    name: "App",
    components: {
        // InfiniteScroll,
        SphereScroll,
    },
    data: function () {
        return {
            dataList: [],
            selectValue: 0,
        };
    },
    created: function () {
        for (let index = 0; index < 50; index++) {
            this.dataList.push({ name: index });
        }
    },
    methods: {
        onSelectChange(index) {
            this.selectValue = this.dataList[index].name;
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
    color: #2c3e50;
}

.gradient-text[data-v-fb6d3afe] {
    background: linear-gradient(
        141.27deg,
        #ff904e -4.24%,
        #ff5982 21.25%,
        #ec68f4 44.33%,
        #79e2ff 83.46%
    );
    background-size: 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-animation: gradient-data-v-fb6d3afe 10s ease infinite;
    animation: gradient-data-v-fb6d3afe 10s ease infinite;
    -webkit-text-fill-color: transparent;
    font-size: 50px;
}
@keyframes gradient-data-v-fb6d3afe {
    0% {
        background-position: 0 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    to {
        background-position: 0 50%;
    }
}
.ListItem {
    font-size: 24px;
}
</style>
