<template>
    <div style="position: relative; overflow: hidden" :style="{height: (2 * viewHeight) + 'px', width: scrollWidth + 'px',}">
        <div class="middle-line"></div>
        <div
            class="scroll-container"
            :style="{ 
                width: '100%',
                height: scrollHeight + 'px',
                transform: `translate(0, -${scrollHeight / 2 - viewHeight}px)`
            }"
            @touchstart="touchStart"
            @touchend="touchEnd"
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
                    top: `${(scrollHeight - itemHeight) / 2}px`,
                    opacity: itemDatas[index] && itemDatas[index].visible ? '1' : '0',
                    transform: `rotateX(${itemDatas[index] ? itemDatas[index].rotate : 0}deg) translate3d(0, ${itemOffsetY(index)}px, ${itemOffsetZ(index)}px)`,
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
            topSpaceHeight: 0,
            bottomSpaceHeight: 0,
            itemDatas: [],
            touchData: {
                last: {
                    pos: 0,
                    time: 0
                },
                current: {
                    pos: 0,
                    time: 0
                }
            },
            scrollTop: 0,
            acceleration: 10, //惯性滑动的加速度
            requestAnimationId: 0
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
        viewHeight() {
            return (this.scrollHeight / Math.PI).toFixed(3);
        },
        velocity() {
            let velocity;
            velocity = (this.touchData.current.pos - this.touchData.last.pos) / this.itemHeight * 1000 / (this.touchData.current.time - this.touchData.last.time).toFixed(3)
            return velocity;
        },
        middleIndex() {
            return Math.floor((this.scrollHeight / 2 + this.scrollTop) / this.itemHeight);
        },
        minScorllTop() {
            return -(this.scrollHeight - this.itemHeight) / 2;
        },
        maxScrollTop() {
            return (this.dataList.length * this.itemHeight -(this.scrollHeight + this.itemHeight) / 2);
        }
    },
    created: function () {
        for(let i = 0; i <= this.dataList.length; i++) {
            let itemData = {};
            itemData.visible = false;
            itemData.rotate = 0;
            this.itemDatas.push(itemData);
        }
        this.setRotate(0);
    },
	mounted: function () {
		const element = document.getElementsByClassName('scroll-container')[0];
		element.addEventListener('touchmove', this.touchMove)
	},
    methods: {
        touchStart(e) {
            this.touchData.current.pos = e.touches[0].clientY || e.clientY;
            this.touchData.current.time = new Date().getTime();

            this.stop();
        },
		touchMove(e) {
            e.preventDefault();
            this.touchData.last.pos = this.touchData.current.pos;
            this.touchData.last.time = this.touchData.current.time;

            this.touchData.current.pos = e.touches[0].clientY || e.clientY;
            this.touchData.current.time = new Date().getTime();
            const moveLength = (this.touchData.last.pos - this.touchData.current.pos);
            if(moveLength === 0) return;
            let scrollTop = this.scrollTop;
            scrollTop += moveLength;
            this.doScroll(scrollTop);
		},
        touchEnd(e) {
            this.endScroll();
        },
        doScroll(scrollTop) {
            this.setRotate(scrollTop);
        },
        endScroll() {
            let time = Math.abs(this.velocity / this.acceleration);
            let totalScrollLen = this.velocity * time + this.acceleration * time * time / 2;
            totalScrollLen = totalScrollLen * 3;
            let finalScroll = this.scrollTop - totalScrollLen;
            this.anmiateScroll(finalScroll, time);
        },
        stop() {
            cancelAnimationFrame(this.requestAnimationId);
        },
        //通过offset滑动，停止滑动后复位到选中的item
        anmiateScroll(finalScroll, time) {
            for(let i = 0; i <= this.dataList.length; i++) {
                const offset = Math.abs(finalScroll - i * this.itemHeight);
                if(offset < this.itemHeight) {
                    finalScroll = i * this.itemHeight
                }
            }
            const startTime = new Date().getTime() / 1000;
            const startPos = this.scrollTop;
            const totalScrollLen = finalScroll - startPos;

            let curTime = 0;
            
            return new Promise((resolve) => {
                const tick = () => {
                    curTime = new Date().getTime() / 1000 - startTime;

                    if(curTime < time) {
                        this.setRotate(startPos + this.easing(curTime / time) * totalScrollLen);
                        this.requestAnimationId = requestAnimationFrame(tick);
                    }else {
                        resolve();
                        this.stop();
                        this.setRotate(finalScroll);
                    }
                };
                tick();
            });
        },
        setRotate(offset) {
            this.scrollTop = Math.min(offset, this.maxScrollTop);
            this.scrollTop = Math.max(this.scrollTop, this.minScorllTop);

            for (let index = 0; index <= this.dataList.length; index++) {
                let itemData = {}, L = 0, rotate = 0;
                this.itemDatas[index].visible = false;

                //只计算视图之内的item
                if((this.middleIndex - parseInt(this.itemNum / 2)) <= index && index <= (this.middleIndex + parseInt(this.itemNum / 2))) {
                    //算出每个item到中线的距离 这个是L  弧长
                    L = this.scrollTop + (this.scrollHeight - this.itemHeight) / 2 - index * this.itemHeight;
                    rotate = L / (this.scrollHeight - this.itemHeight)  * 180;
                    itemData.rotate = rotate;
                    itemData.position = L;
                    itemData.visible = true;
                }
                this.itemDatas[index] = itemData;
            }
            this.itemDatas = [...this.itemDatas];
        },
        itemOffsetZ(index) {
            let angle = this.itemDatas[index].rotate;
            let offset = this.viewHeight / 2 - Math.cos(angle / 180 * Math.PI) * this.viewHeight / 2;
            return offset;
        },
        itemOffsetY(index) {
            let angle = this.itemDatas[index].rotate;
            let offset = this.itemDatas[index].position - Math.sin(angle / 180 * Math.PI) * (this.viewHeight / 2);
            //实际上item经X轴旋转后高度会变化，这一步是为了消除高度变化带来的误差
            offset = Math.sin(angle / 180 * Math.PI) * this.itemHeight + offset;
            return -offset;
        },
        easing(pos) {
            return -(Math.pow((pos - 1), 4) - 1);
        }
    },
};
</script>

<style scoped>
.scroll-container {
    overflow-y: scroll;
    overflow-x: hidden;
    position: relative;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
}
::-webkit-scrollbar {
    display: none;  /* Chrome Safari */
}
.item {
    display: flex;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    position: absolute;
    left: 0;
}
.middle-line {
    position: absolute;
    width: 100%;
    top: 50%;
    border: 1px solid slateblue;
    z-index: 10000;
}
</style>