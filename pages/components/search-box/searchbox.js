// pages/components/search-box/searchbox.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		searchShow: {
			type: Boolean,
			value: false
		}
	},
	/**
	 * 组件的初始数据
	 */
	data: {
		content:''
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		back: function() {
			this.cancel()
		},
		// input
		input: function(e) {
			this.setData({
				content:e.detail.value
			})
			this.triggerEvent('input', e.detail.value)
		},
		// 发送
		sendCon: function(e) {
			this.triggerEvent('sendCon', e.detail.value)
		},
		// 清空输入框
		cancel:function(){
			this.setData({
				content:''
			})
			this.triggerEvent('cancel')
		}
	}
})
