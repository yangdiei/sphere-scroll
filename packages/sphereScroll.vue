<template>
  <div class="yd-root" 
    :style="{height:  (viewHeight) + 'px',width: viewWidth + 'px',}" 
    @touchstart="touchStart" 
    @touchend="touchEnd"
  >
    <div class="yd-top-mask yd-mask" :style="{height: (viewHeight - scrollItemHeight - 1) / 2 + 'px', top: 0}"></div>
    <div
      class="yd-scroll-container"
      :style="{ 
        width: '100%',
        height: scrollHeight + 'px',
        transform: `translate(0, -${(scrollHeight) / 2 - viewHeight / 2}px)`
      }"
      ref="scrollContainer"
    >
      <div
        ref="item"
        class="yd-item"
        v-for="(item, index) in dataList"
        :key="index"
        :style="{
          height: scrollItemHeight + 'px',
          width: viewWidth + 'px',
          top: `${(scrollHeight - scrollItemHeight) / 2}px`,
          opacity: itemDatas[index] && itemDatas[index].visible ? '1' : '0',
          transform: `rotateX(${itemDatas[index] ? itemDatas[index].rotate : 0}deg) translate3d(0, ${itemOffsetY(index)}px, ${itemOffsetZ(index)}px)`,
        }"
      >
        <div v-if="!$scopedSlots.item" class="yd-item-content">
          {{ item }}
        </div>
        <slot v-else name="item" v-bind:item="item"></slot>
      </div>
    </div>
    <div class="yd-bottom-mask yd-mask" :style="{height: (viewHeight - scrollItemHeight - 1) / 2 + 'px', bottom: 0}"></div>
  </div>
</template>

<script>
import Vue from 'vue';
import { supportPassive } from './util';
const passiveSupported = supportPassive();

export default {
  name: "Sphere-Scroll",
  data: function () {
    return {
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
      acceleration: 20, //惯性滑动的加速度
      requestAnimationId: 0,
      isInner: false,
      passiveSupported: passiveSupported
    };
  },
  props: {
    viewHeight: {
      type: [String, Number],
      default: 350,
    },
    viewWidth: {
      type: [String, Number],
      default: 300,
    },
    itemHeight: {
      type: [String, Number],
      default: 40,
    },
    dataList: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    scrollHeight() {
      return (this.viewHeight * Math.PI).toFixed(3) / 2;
    },
    itemNum() {
      let num = Math.floor(this.scrollHeight / this.itemHeight);
      num = num % 2 == 1 ? num : num + 1;
      return num;
    },
    velocity() {
      let velocity;
      velocity = (this.touchData.current.pos - this.touchData.last.pos) / this.itemHeight * 1000 / (this.touchData.current.time - this.touchData.last.time).toFixed(3)
      return velocity * 1.5;
    },
    middleIndex() {
      let index = Math.floor((this.scrollHeight / 2 + this.scrollTop) / this.scrollItemHeight);
      index = Math.min(this.dataList.length, index);
      index = Math.max(0, index); 
      return index;
    },
    minScorllTop() {
      return -(this.scrollHeight - this.scrollItemHeight) / 2;
    },
    maxScrollTop() {
      return (this.dataList.length * this.scrollItemHeight -(this.scrollHeight + this.scrollItemHeight) / 2);
    },
    scrollItemHeight() {
      return this.scrollHeight / this.itemNum;
    }
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
    this.$emit('selectChange', this.middleIndex);
  },
  mounted: function () {
    console.log(this.$scopedSlots);
    document.addEventListener('mousedown', this.touchStart, this.passiveSupported ? {passive: false} : false);
    document.addEventListener('mouseup', this.touchEnd, this.passiveSupported ? {passive: false} : false);
  },
  methods: {
    touchStart(e) {
      e.preventDefault();
      let _this = this
      _this.isInner = false;
      e.composedPath().forEach(element => {
          if(element.className === 'yd-root') {
              _this.isInner = true;
          }
      });
      if(!_this.isInner) return;
      if (e.target) e.target.addEventListener('touchmove', _this.touchMove, this.passiveSupported ? {passive: false} : false);
      document.addEventListener('mousemove', _this.touchMove, this.passiveSupported ? {passive: false} : false);

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
      e.preventDefault();
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
      for(let i = - Math.floor(this.itemNum / 2); i <= this.dataList.length; i++) {
        const offset = Math.abs(finalScroll - i * this.scrollItemHeight);
        if(offset < this.scrollItemHeight * 0.5) {
          finalScroll = i * this.scrollItemHeight
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
            L = this.scrollTop + (this.scrollHeight - this.scrollItemHeight) / 2 - index * this.scrollItemHeight;
            rotate = L / (this.scrollHeight - this.scrollItemHeight)  * 180;
            itemData.rotate = rotate;
            itemData.position = L;
            if(Math.abs(rotate) < 90) {
              itemData.visible = true;
            }
          }
          this.itemDatas[index] = itemData;
        }
        this.itemDatas = [...this.itemDatas];
    },
    itemOffsetZ(index) {
      let rotate = this.itemDatas[index].rotate;
      let offset =  this.viewHeight / 2 - Math.cos(rotate / 180 * Math.PI) * this.viewHeight / 2;
      return offset;
    },
    itemOffsetY(index) {
      let {rotate, position} = {...this.itemDatas[index]};
      let offset = Math.sin(rotate / 180 * Math.PI) * (this.viewHeight) / 2;
      return -offset;
    },
    setSeclectIndex(index) {
      const scrollTop = (index - Math.floor(this.itemNum / 2)) * this.scrollItemHeight;
      this.setRotate(scrollTop);
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
.yd-root {
  position: relative;
  overflow: hidden; padding: 6px 0;
}
.yd-scroll-container {
  overflow-y: scroll;
  overflow-x: hidden;
  position: relative;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  z-index: 12;
  color: #000000;
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
  z-index: 999;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.yd-item-content {
  font-size: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.yd-mask {
  position: absolute;
  left: 0;
  width: 100%;
  z-index: 13;
  background: #f7f7f7;
  opacity: 0.5;
}
.yd-top-mask {
  border-bottom: 1px solid #e5e5ee;
}
.yd-bottom-mask {
  border-top: 1px solid #e5e5ee;
}
</style>