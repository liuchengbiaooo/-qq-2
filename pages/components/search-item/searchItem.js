// pages/components/search-item.js
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
	searchArr:[
		'全部',
		'栏目',
		'频率',
		'广播'
	],
	i:0
  },
  /**
   * 组件的方法列表
   */
  methods: {
		searchItem:function(e){
			console.log('选择中的结果数据',e.currentTarget.dataset.index)
			this.setData({
				i:e.currentTarget.dataset.index
			})
			this.triggerEvent('searchItem',e.currentTarget.dataset.index);
		}
  }
})
