// pages/components/notice-box/noticebox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
	  diange:{
		  type:Boolean,
		  value:false
	  },
	  toupiao:{
		  type:Boolean,
		  value:false
	  },
	  jinagcai:{
		  type:Boolean,
		  value:false
	  },
	  noSongcard:{
		  type:Boolean,
		  value:false
	  },
	  songcard:String,   //点歌卡
	  endtime:String,    //活动结束时间
	  squareNum:{
		type:Number,
		value:null
	  },  
	  consideNum:{
		type:Number,
		value:null
	  }, 
	  square:{
		type:Number,
		value:null
	  },  
	  fanfang:{
		type:Number,
		value:null
	  }, 
	  squareText:String,
	  fanfangText:String,
  },
  /**
   * 组件的初始数据
   */
  data: {
		dgvalue:null,
		jcvalue:null
  },
  /**
   * 组件的方法列表
   */
  onLoad:function(){
		console.log('自定义组件')
  },
  methods: {
	  // 内容this.data.value
	  dginput:function(e){
		  this.setData({
			  dgvalue:e.detail.value,
		  })
	  },
	  // 竞猜
	  jcinput:function(e){
		this.setData({
			  jcvalue:e.detail.value,
		})
	  },
	  //点歌按钮
	  diangeBtn:function(){
		if(this.data.songcard>0){
			this.triggerEvent('diangeBtn',this.data.dgvalue);
		}else{
			// this.setData({
			// 	noSongcard:true
			// })
			wx.showToast({
				title: '点歌卡不足,明日请早',
				icon: 'none',
				duration: 2000
			})
			this.setData({
				value:null
			})
		}
	  },
	  jingcaiBtn:function(){
		 this.triggerEvent('jingcaiBtn',this.data.jcvalue);
		 this.setData({
			value:null
		})
	  },
	  //投票1
	  toupiao1Btn:function(){
		let that=this;
		this.triggerEvent('toupiao1Btn','正方');
		if(that.data.squareText=='支持蓝方'){
			that.setData({
				plusoneShow1:true
			})
			setTimeout(function(){
				that.setData({
					plusoneShow1:false
				})
			},1000);
		}
	  },
	  //投票2
	  toupiao2Btn:function(){
		let that=this;
		this.triggerEvent('toupiao2Btn','反方');
		if(that.data.fanfangText=='支持红方'){
			that.setData({
				plusoneShow2:true
			})
			setTimeout(function(){
				that.setData({
					plusoneShow2:false
				})
			},1000);
		}
	  },
	  //关闭
	  guangbiBtn:function(){
		 this.triggerEvent('guangbiBtn');
	  },
	  huodeBtn:function(){
		  wx.showToast({
		  	title: '正在接入',
		  	icon: 'none',
		  	duration: 2000
		  })
	  }
  }
})
