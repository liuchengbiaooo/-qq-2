// pages/components/swipe-box/swipebox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    advertArr:Array
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
    swipeBtn:function(data){
        this.triggerEvent('swipeBtn', data.currentTarget.dataset.item)
    }
  }
})
