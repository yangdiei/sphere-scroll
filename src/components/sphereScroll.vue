<template>
    <div style="position: relative">
        <div class="middle-line"></div>
        <div
            class="scroll-container"
            :style="{ height: scrollHeight + 'px', width: scrollWidth + 'px' }"
            @scroll="onScroll"
            ref="scrollContainer"
        >
            <div
                class="top-space"
                :style="{ height: topSpaceHeight + 'px' }"
            ></div>
            <div
                ref="item"
                class="item"
                v-for="(item, index) in dataList"
                :key="index"
                :style="{
                    height: itemHeight + 'px',
                    width: itemWidth + 'px',
                }"
            >
                <slot name="item" v-bind:item="item"> </slot>
            </div>
            <div
                class="bottom-space"
                :style="{ height: bottomSpaceHeight + 'px' }"
            ></div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Sphere-Scroll",
    data: function () {
        return {
            lineSp: 0, //线速度
            itemNum: 11, //可视区域item的数量，为奇数
            itemHeight: 40, //item高度
            itemWidth: 300,
            // r: 10, //半径
            offset: 0, //偏移量
            topSpaceHeight: 0,
            bottomSpaceHeight: 0,
            middleIndex: -1,
        };
    },
    props: {
        scrollHeight: {
            type: [String, Number],
            default: 440,
        },
        scrollWidth: {
            type: [String, Number],
            default: 300,
        },
        dataList: {
            type: Array,
            default: () => [],
        },
    },
    computed: {
        angularSp() {
            //角速度
            return this.lineSp / this.r;
        },
        viewHeight() {
            return (this.scrollHeight / Math.PI).toFixed(3);
        },
    },
    created: function () {},
    methods: {
        onScroll(e) {
            let scrollTop = e.target.scrollTop;
            this.offset = ((scrollTop / this.itemHeight) % 1).toFixed(3);
            // let circle = Math.PI * this.viewHeight;
            // this.itemNum = Math.ceil(circle / this.itemHeight);
            // let y = Math.abs(
            //     1 - Math.sqrt(((2 - this.offset) ^ 2) - 2 * this.offset)
            // ).toFixed(3);
            // console.log("x:" + this.offset, "y:" + y);
            // this.topSpaceHeight = Math.max(0, (scrollTop - ))
            this.middleIndex =
                (this.scrollHeight / 2 + scrollTop) / this.itemHeight;
            console.log(this.middleIndex);
            for (
                let index = 0;
                index <= Math.floor(this.itemNum / 2);
                index++
            ) {
                // let itemPos = scrollTop + this.itemHeight * index;
                let L =
                    scrollTop +
                    (this.itemHeight * this.itemNum) / 2 -
                    (index + 0.5) * this.itemHeight; //----------------------算出每个item到中线的距离 这个是L  弧长
                let x = Math.cos(L / this.viewHeight / 2); //缩放
                let y = Math.sin(L / this.viewHeight / 2); //位置
                console.log("x:" + x, "y:" + y);
            }
        },
    },
};
</script>

<style scoped>
.scroll-container {
    overflow-y: scroll;
    overflow-x: hidden;
    position: relative;
}
.item {
    display: flex;
    align-items: center;
    justify-content: center;
}
.middle-line {
    position: absolute;
    width: 100%;
    top: 50%;
    border: 1px solid slateblue;
    z-index: 10000;
}
</style>