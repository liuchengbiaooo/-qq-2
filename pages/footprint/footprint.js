// pages/footprint/footprint.js
const App = getApp();
import https from '../../utils/https.js';

var register = require('../../utils/refreshLoadRegister.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		navHeight: null,
		listData: [],
		itemTitle: '我的足迹',
		heatStatus: true,
		currentSize: 1, //当前页数
		allpage: null, //总页数
		append: '',
		downLoadState: false,
		pageType: 1
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		// 计算高度
		that.setData({
			navHeight: App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight,
			itemTitle: options.type == 'order' ? '我的订阅' : options.type == 'history' ? '我的足迹' : '',
			heatStatus: options.type == 'order' ? false : true,
			pageType: options.type == 'order' ? '1' : options.type == 'history' ? '2' : '', //1订阅列表 2历史列表
		});
		that.getData(options.type == 'order' ? '1' : options.type == 'history' ? '2' : '', that.data.currentSize)
		//初始化下拉刷新加载更多
		register.register(this);
	},
	//模拟刷新数据
	refresh: function() {
		this.setData({
			listData: [],
			currentSize: 1
		});
		this.getData(this.data.pageType, this.data.currentSize);
	},
	//模拟加载更多数据
	loadMore: function() {
		if (this.data.currentSize < this.data.allpage) {
			let currentSize = this.data.currentSize + 1
			this.getData(this.data.pageType, currentSize);
		} else {
			this.data.
			register.loadFinish(this, true);
			wx.showToast({
				title: '没有更多',
				icon: 'none',
				duration: 2000
			})
			console.log('没有更多')
		}
	},
	handlerGobackClick() {
		wx.navigateBack({
			delta: 1
		})
	},
	getData(type, currentSize) {
		const that = this,
			header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			};
		switch (Number(type)) {
			case 1: //订阅列表
				// that.data.downLoadState = false;
				https.getFollowList({
					page: currentSize,
					type: 1
				}, header).then(res => {
					console.log('订阅列表', res.data.result)
					if (res.data.code == 200) {
						if (res.data.result.list.length > 0) {
							for (let i = 0; i < res.data.result.list.length; i++) {
								that.data.listData.push(res.data.result.list[i])
							}
							that.setData({
								listData: that.data.listData,
								allpage: res.data.result.allpage, //总页数
								currentSize: res.data.result.page //当前页数
							})
							register.loadFinish(that, true);
						}
					}
					// console.log(res)
				})
				break;
			case 2: //历史记录
				// https.getHistory({
				// 	page: currentSize
				// }, header).then(res => {
				// 	console.log('历史记录', res.data.result.msg.list)
				// 	if (res.data.code == 200) {
				// 		if (res.data.result.msg.list.length > 0) {
				// 			that.setData({
				// 				listData: res.data.result.msg.list
				// 			})
				// 			register.loadFinish(that, true);
				// 		}
				// 	} else {
				// 		that.toLogin();
				// 	}
				// })
				break;
		}
	},
	// 跳转到播放界面
	onGoRoom: function(e) {
		console.log('获取到点击了的按钮', e.detail)
		let that = this;
		for (let i = 0; i < that.data.listData.length; i++) {
			if (that.data.listData[i].room_id == e.detail) {
				if (that.data.listData[i].live_status == 1) {
					wx.navigateTo({
						url: '/pages/play/play?room_id=' + that.data.listData[i].room_id,
					});
				} else {
					console.log('点击了预约直播', that.data.listData[i].room_id)
					if (that.data.listData[i].is_subscribe == 1) {
						wx.showModal({
							title: '温馨提示',
							content: '确定取消预约吗?',
							success(resmodel) {
								if (resmodel.confirm) {
									that.subscribe(that.data.listData[i].room_id, i)
								} else if (resmodel.cancel) {
									return false;
								}
							}
						})
					} else {
						that.subscribe(that.data.listData[i].room_id, i)
					}
				}
			}
		}
	},
	// 预约接口
	subscribe: function(room_id, index) {
		let self = this,
			params = {
				c_id: room_id
			},
			header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			}
		if (header.token) {
			https.subscribe(params, header).then(res => {
				console.log('预约数据', res.data.result.msg)
				if (res.data.code == 200) {
					if (res.data.result.msg == "预约成功") {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						self.data.listData[index].is_subscribe = 1;
						self.setData({
							listData: self.data.listData //手动修改预约状态
						})
					} else {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						self.data.listData[index].is_subscribe = 0;
						self.setData({
							listData: self.data.listData //手动修改预约状态
						})
					}
				}
			})
		} else {
			console.log('没有登入')
		}
	},
	freshData() {
		this.getData(this.data.pageType);
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
		return {
			title: '电台直播-国内专业音频分享平台,随时随地,听我想听！',
			desc: '听你想听,尽在其中',
			imageUrl: 'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/1.jpeg', //这是图片
			path: 'pages/index/index' //这是一个路径
		}
	}
})
