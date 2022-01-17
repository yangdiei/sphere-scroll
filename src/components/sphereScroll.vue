<template>
    <div style="position: relative; overflow: hidden;" :style="{height: `${2 * viewHeight * (1 - 1 / Math.PI)}px`,width: scrollWidth + 'px',}">
    <!-- <div style="position: relative; overflow: hidden;" :style="{height:  (viewHeight ) + 'px',width: scrollWidth + 'px',}"> -->
        <div class="yd-middle-line" 
            :style="{
                height: itemHeight + 'px',
                top: `calc(50% - ${0.5 * itemHeight}px)`
        }"></div>
        <div
            class="yd-scroll-container"
            :style="{ 
                width: '100%',
                height: scrollHeight + 'px',
                transform: `translate(0, -${(scrollHeight) / 2 - viewHeight * (1 - 1 / Math.PI)}px)`
            }"
            @touchstart="touchStart"
            @touchend="touchEnd"
            ref="scrollContainer"
        >
            <div
                ref="item"
                class="yd-item"
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
        </div>
    </div>
</template>

<script>
export default {
    name: "Sphere-Scroll",
    data: function () {
        return {
            lineSp: 0, //线速度
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
            requestAnimationId: 0,
            isInner: false,
        };
    },
    props: {
        scrollHeight: {
            type: [String, Number],
            default: 840,
        },
        // viewHeight: {
        //     type: [String, Number],
        //     default: 600,
        // },
        scrollWidth: {
            type: [String, Number],
            default: 300,
        },
        itemHeight: {
            type: [String, Number],
            default: 40,
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
    computed: {
        viewHeight() {
            return (this.scrollHeight / Math.PI).toFixed(3);
        },
        // scrollHeight() {
        //     return (this.viewHeight * Math.PI).toFixed(3);
        // },
        itemNum() {
            let num = Math.floor(this.scrollHeight / this.itemHeight);
            num = num % 2 == 1 ? num : num + 1;
            console.log(num)
            return num;
        },
        velocity() {
            let velocity;
            velocity = (this.touchData.current.pos - this.touchData.last.pos) / this.itemHeight * 1000 / (this.touchData.current.time - this.touchData.last.time).toFixed(3)
            return velocity * 1.5;
        },
        middleIndex() {
            let index = Math.floor((this.scrollHeight / 2 + this.scrollTop) / this.itemHeight);
            index = Math.min(this.dataList.length, index);
            index = Math.max(0, index); 
            return index;
        },
        minScorllTop() {
            return -(this.scrollHeight - this.itemHeight) / 2;
        },
        maxScrollTop() {
            return (this.dataList.length * this.itemHeight -(this.scrollHeight + this.itemHeight) / 2);
        },
    },
    watch: {
        middleIndex() {
            this.$emit('selectChange', this.middleIndex);
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
        document.addEventListener('mousedown', this.touchStart);
        document.addEventListener('mouseup', this.touchEnd);
	},
    methods: {
        touchStart(e) {
            let _this = this
            _this.isInner = false;
            e.path.forEach(element => {
                if(element.className === 'yd-scroll-container') {
                    _this.isInner = true;
                }
            });
            if(!_this.isInner) return;
            if (e.target) e.target.addEventListener('touchmove', _this.touchMove);
            document.addEventListener('mousemove', _this.touchMove);

            let clientY = _this.isTouch(e) ? e.touches[0].clientY : e.clientY;
            _this.startScroll(clientY)
            _this.stop();
        },
		touchMove(e) {
            e.preventDefault();
            this.touchData.last.pos = this.touchData.current.pos;
            this.touchData.last.time = this.touchData.current.time;

            this.touchData.current.pos = this.isTouch(e) ? e.touches[0].clientY : e.clientY;
            this.touchData.current.time = new Date().getTime();
            const moveLength = (this.touchData.last.pos - this.touchData.current.pos) * 1.25;
            if(moveLength === 0) return;
            let scrollTop = this.scrollTop;
            scrollTop += moveLength;
            this.doScroll(scrollTop);
		},
        touchEnd(e) {
            if (e.target) e.target.removeEventListener('touchmove', this.touchMove);
            document.removeEventListener('mousemove', this.touchMove);

            if(!this.isInner) return;
            this.endScroll();
        },
        startScroll(posY) {
            this.touchData.current.pos = posY;
            this.touchData.current.time = new Date().getTime();
            this.stop();
        },
        doScroll(scrollTop) {
            this.setRotate(scrollTop);
        },
        endScroll() {
            let time = Math.abs(this.velocity / this.acceleration);
            if(time === 0) return;
            let totalScrollLen = this.velocity * time + this.velocity / Math.abs(this.velocity) * this.acceleration * time * time / 2;
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
                if(offset < this.itemHeight * 0.5) {
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
                    if(Math.abs(rotate) < 70) {
                        itemData.visible = true;
                    }
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
        },
        isTouch(e) {
            return ['touchstart', 'touchmove', 'touchend'].includes(e.type);
        }
    },
};
</script>

<style scoped>
.yd-scroll-container {
    overflow-y: scroll;
    overflow-x: hidden;
    position: relative;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 10+ */
}
::-webkit-scrollbar {
    display: none;  /* Chrome Safari */
}
.yd-item {
    display: flex;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
    position: absolute;
    left: 0;
    cursor: pointer;
}
.yd-middle-line {
    position: absolute;
    width: 100%;
    border: 1px solid slateblue;
    z-index: 10000;
}
</style>