<template>
    <div class="scroll-container" :style="{ height: scrollHeight + 'px', width: scrollWidth + 'px' }" @scroll="onScroll" ref="scrollContainer">
        <div class="top-space" :style="{ height: topSpaceHeight + 'px' }"></div>
        <div ref="item" class="item" v-for="(item, index) in showList" :key="index" :style="{
                            height: itemHeight + 'px',
                            width: itemWidth + 'px',
                        }">
            <slot name="item" v-bind:item="item"> </slot>
        </div>
        <div class="bottom-space" :style="{ height: bottomSpaceHeight + 'px' }"></div>
    </div>
</template>

<script>
export default {
    name: "Infinite-Scroll",
    props: {
        scrollHeight: {
            type: [String, Number],
            default: 200,
        },
        scrollWidth: {
            type: [String, Number],
            default: 300,
        },
        itemNum: {
            type: [String, Number],
            default: 20,
        },
        itemHeight: {
            type: [String, Number],
            default: 20,
        },
        itemWidth: {
            type: [String, Number],
            default: 300,
        },
        dataList: {
            type: Array,
            default: () => [],
        },
    },
    data: function() {
        return {
            showList: [],
            startIndex: 0,
            topSpaceHeight: 0,
            bottomSpaceHeight: 0,
            tag: {},
        };
    },
    created: function() {
        this.showList = this.dataList.slice(this.startIndex, this.itemNum);
        this.bottomSpaceHeight = this.totalHeight - this.contentHeight;
    },
    mounted: function() {
        this.tag = this.$refs.item[0];
        console.log(this.tag)
    },
    watch: {
        // startIndex(val) {
        //     this.showList = this.dataList.slice(val, val + this.itemNum);
        //     // this.$refs.scrollContainer.setAttribute("scrollHeight", 400);
        //     // console.log(val);
        // },
    },
    computed: {
        contentHeight() {
            return this.itemNum * this.itemHeight;
        },
        totalHeight() {
            return this.dataList.length * this.itemHeight;
        },
        showItemNum() {
            return Math.ceil(this.scrollHeight / this.itemHeight);
        },
    },
    methods: {
        onScroll(e) {
            let scrollTop = e.target.scrollTop;
            let offset = e.target.scrollTop;
            let num = Math.floor(offset / this.itemHeight);
            let count = Math.floor(num / (this.itemNum - this.showItemNum));
            let index = (this.itemNum - this.showItemNum) * count;

            if (num >= index) {
                if (this.startIndex != index) {
                    this.startIndex = index;
                    this.topSpaceHeight = this.startIndex * this.itemHeight;
                    let layout = [];
                    layout.push(this.renderExtraTag("top-space", this.topSpaceHeight, ''));
                    for (let index = this.startIndex; index < Math.min(this.startIndex + this.itemNum, this.dataList.length); index++) {
                        const element = this.dataList[index];
                        let  item = this.renderExtraTag("item", this.itemHeight, element.name);
                        layout.push(item)
                    }
                    this.bottomSpaceHeight =
                        this.totalHeight -
                        this.showList.length * this.itemHeight -
                        this.topSpaceHeight;
                    layout.push(this.renderExtraTag("bottom-space", this.bottomSpaceHeight, ''));
                    this.$refs.scrollContainer.innerHTML = layout.join('');
                    // console.log(num, index);
                    e.target.scrollTop = scrollTop;

                    // this.topSpaceHeight = this.startIndex * this.itemHeight;
                    // this.bottomSpaceHeight =
                    //     this.totalHeight -
                    //     this.showList.length * this.itemHeight -
                    //     this.topSpaceHeight;
                    // this.showList = this.dataList.slice(
                    //     this.startIndex,
                    //     this.startIndex + this.itemNum
                    // );
                    // this.startIndex = index;
                    // e.target.scrollTop = scrollTop;

                }
            }
        },
        renderExtraTag(class_name, height, value) {
            var tag = document.createElement('div');
            tag.className = class_name;
            if(class_name == 'item') {
                tag = this.tag;
                tag.getElementsByClassName("value")[0].innerText = value;
            }
            height && (tag.style.height = height + 'px');
            return tag.outerHTML;
        },
    },
};
</script>

<style scoped>
.scroll-container {
    overflow-y: scroll;
    overflow-x: hidden;
}
</style>
