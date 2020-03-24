// pages/account/account.js

const App = getApp();
const date = new Date()
const years = []
const months = []

for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i)
}
for (let i = 1; i <= 12; i++) {
  months.push(i)
}

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		years: years,
		year: date.getFullYear(),
		months: months,
		month: 2,
		value: [9999, 1],
		pickShow:false
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
	bindChange: function (e) {
	    const val = e.detail.value
	    this.setData({
	      year: this.data.years[val[0]],
	      month: this.data.months[val[1]],
	    })
	},
	consumptionBtn:function(){
		this.setData({
			pickShow:!this.data.pickShow
		})
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
