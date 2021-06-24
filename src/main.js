import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false


Vue.directive('touchMove', {
	inserted(el, binding, vnode) {
		if (el.style.height === 'auto') return // 当绑定元素height为auto时，直接返回
		let start, dateStart
		let scrollPrevious = 0 // 保存滚动条上次所在位置
		let moveSave = []
		let dateSave = []
		let timmer = null
		let scrollNow = 0 // 滚动当前所在位置

		el.addEventListener('touchstart', function (e) {
			console.log("touchstart")
			clearInterval(timmer)
			moveSave = []
			dateSave = []
			scrollPrevious = el.scrollTop
			start = e.targetTouches[0].clientY // 手指开始接触屏幕时所在屏幕Y轴位置
			dateStart = new Date()
		})

		el.addEventListener('touchmove', function (e) {
			e.preventDefault()
			let move = e.targetTouches[0].clientY // 手指滑动时所在屏幕Y轴位置
			let distance = move - start // 每次滑动的距离
			let date = new Date()
			if (moveSave.length < 2) {
				moveSave.push(move) // 保存最近两次滑动所在的位置跟时间
				dateSave.push(date)
			} else {
				moveSave.shift()
				moveSave.push(move)
				dateSave.shift()
				dateSave.push(date)
			}
			el.scrollTop = -distance + scrollPrevious
			if (moveSave[1] < moveSave[0]) {
				if (binding.value && binding.value.upScroll) {
					binding.value.upScroll(el, vnode) // 向上滑动时运行的函数
				}
			} else {
				if (binding.value && binding.value.downScroll) {
					binding.value.downScroll(el, vnode) // 向下滑动时运行的函数
				}
			}
		})

		el.addEventListener('touchend', function () {
			let speed = 0 // 滑动速度（单位px/ms）
			let elementHeight = el.scrollHeight - el.clientHeight // 滚动条最大值
			let reduction = 0.01 // 加速度
			if (moveSave.length < 2) {
				speed = (moveSave[0] - start) / (dateSave[0] - dateStart)
			} else {
				speed = (moveSave[1] - moveSave[0]) / (dateSave[1] - dateSave[0])
			}
			if (speed > 5) { // 限制speed的最大值跟最小值
				speed = 5
			}
			if (speed < -5) {
				speed = -5
			}
			if (Math.abs(speed) > .5) { // speed超过某一直后就会持续移动
				timmer = setInterval(function () {
					if (speed < 0) {
						speed = speed + reduction
						if (binding.value && binding.value.upScroll) {
							binding.value.upScroll(el) // 向上滑动时运行的函数
						}
						if (speed > 0) {
							speed = 0
						}
						scrollNow += -speed * 16
					} else if (speed > 0) {
						speed = speed - reduction
						if (binding.value && binding.value.downScroll) {
							binding.value.downScroll(el) // 向下滑动时运行的函数
						}
						if (speed < 0) {
							speed = 0
						}
						scrollNow -= speed * 16
					}
					el.scrollTop = scrollNow
					if (speed === 0 || el.scrollTop === 0 || el.scrollTop === elementHeight) {
						clearInterval(timmer)
					}
				}, 16)
			}
		})
	}
})

new Vue({
	render: h => h(App),
}).$mount('#app')
