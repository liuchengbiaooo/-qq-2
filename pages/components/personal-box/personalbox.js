// pages/components/personal-box/personalbox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
	  personalboxData:{
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
    // @事件
		atBtn:function(){
			 this.triggerEvent('atBtn',this.data.personalboxData) 
    },
    // 去主页按钮
    gozhuyeBtn:function(){
			 this.triggerEvent('gozhuyeBtn') 

    }
  }
})
