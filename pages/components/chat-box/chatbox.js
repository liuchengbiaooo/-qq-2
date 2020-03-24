// pages/components/chat-box/chatbox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
	chatItem:{
		type:Object,
		value:''
	}
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
	  // 点击事件
	  chatboxBtn:function(data){
		// console.log('获取到个人资料',data.currentTarget.dataset.item)
		this.triggerEvent('chatboxBtn',data.currentTarget.dataset.item) 
	  },
	  // 长按事件
	  longchatboxBtn:function(data){
		// console.log('长按事件',data.currentTarget.dataset.item)
		this.triggerEvent('longchatboxBtn',data.currentTarget.dataset.item) 
	  }
  }
})
