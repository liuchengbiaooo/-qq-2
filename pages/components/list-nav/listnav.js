// pages/components/list-nav/listnav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeStatus:'heat',
    activeStyle:'nav_active_style'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chooseList(e){
      this.setData({
        activeStatus : e.currentTarget.dataset.type
      })
      this.triggerEvent('chooseList', e.currentTarget.dataset.type)
    }
  }
})
