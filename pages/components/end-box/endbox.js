// pages/components/end-box/endbox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
		itemData:Object,
		followShow:{
		  type: Boolean,
		  value: true
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
	  followbtn:function(){
		  this.triggerEvent('followbtn')
	  }

  }
})
