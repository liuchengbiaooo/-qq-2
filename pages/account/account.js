// pages/account/account.js

const App = getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		accountData:[
			{
				price:'10',
				originalPrice:"10"
			},
			{
				price:'20',
				originalPrice:"20"
			},
			{
				price:'50',
				originalPrice:"50"
			},
			{
				price:'100',
				originalPrice:"100"
			},
			{
				price:'128',
				originalPrice:"128"
			},
			{
				price:'158',
				originalPrice:"158"
			},
			{
				price:'168',
				originalPrice:"168"
			},
			{
				price:'200',
				originalPrice:"200"
			},
			{
				price:'500',
				originalPrice:"500"
			}
		],
		viewIndex:-1
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		// 计算高度
		that.setData({
			navHeight: App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight
		})
	},
	// 返回上一级
	handlerGobackClick: function() {
		wx.navigateBack({
			delta: 1
		})
	},
	viewBtn:function(e){ //选择充值金额
		console.log(e.currentTarget.dataset.item)
		this.setData({
			viewIndex:e.currentTarget.dataset.index
		})
	},
	consumptionBtn:function(){ //消费明细
		wx.navigateTo({
			url: '/pages/consumption/consumption'
		});
	},
	chongzhiBtn:function(){ //充值
		 if(this.data.viewIndex==-1){
			 wx.showToast({
				title: '请选择金额',
				icon: 'none',
				duration: 2000,
			 })
		 }else{
			 wx.showToast({
				title: '正在接入',
				icon: 'none',
				duration: 2000,
			 })
		 }
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
