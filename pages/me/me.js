const App = getApp();
import https from '../../utils/https.js';
var register = require('../../utils/refreshLoadRegister.js');

// pages/me/me.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		navHeight: null,
		viewLeft: '0',
		userInfo: '', //用户信息
		loginStatus: false, //登录状态
		viewData: [], //观看数据
		follow: 0,
		from: '', //发送着的参数
		currentSize: 1, //当前页数
		allpage: null, //总页数
		zbhdShow: false, //授权按钮判断
		downLoadState: false,
		functionData:[ //功能区域数据
			{
				name:'我的账户',
				icon:'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/me/a1.png'
			},
			{
				name:'消息中心',
				icon:'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/me/a2.png'
			},
			{
				name:'任务中心',
				icon:'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/me/a3.png'
			},
			{
				name:'我的成就',
				icon:'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/me/a4.png'
			}
		]
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		// 计算高度
		that.setData({
			navHeight: App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight,
			from: options.from ? options.from : ''
		})
		if (wx.getStorageSync('info')) {
			that.setData({
				loginStatus: true,
				userInfo: wx.getStorageSync("info")
			})
			that.viewHistory(that.data.currentSize); //刷新第一页数据
		} else {
			that.setData({
				loginStatus: false,
			})
		}	
		//初始化下拉刷新加载更多
		register.register(this);
	},
	//模拟刷新数据
	refresh: function() {
		this.setData({
			viewData: [],
			currentSize: 1
		});
		this.viewHistory(this.data.currentSize);
	},
	//模拟加载更多数据
	loadMore: function() {
		if (this.data.currentSize < this.data.allpage) {
			let currentSize = this.data.currentSize + 1
			this.viewHistory(currentSize);
		} else {
			register.loadFinish(this, true);
			wx.showToast({
				title: '没有更多',
				icon: 'none',
				duration: 2000
			})
			console.log('没有更多')
		}
	},
	// 查看更多历史
	showMore(e) {
		if(this.data.follow>0){
			wx.navigateTo({
				url: '/pages/footprint/footprint?type=' + e.currentTarget.dataset.type
			})
		}else{
			wx.showToast({
				title: '当前没有订阅哦',
				icon: 'none',
				duration: 2000,
			})
		}
	},
	onShow: function() {
		if (wx.getStorageSync('info')) {
			this.setData({
				loginStatus:true,
				userInfo: wx.getStorageSync("info")
			})
			this.getFollowList()   
			this.viewHistory(1,true)
		} 
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},
	//登录接口
	toLogin(e) {
		const that = this;
		https.login().then(res => {
			if (res.data.code == 200) {
				if (that.data.from) {
					wx.reLaunch({
						url: `/pages/${that.data.from}/${that.data.from}`
					})
				}
				let failureTime = Date.parse(new Date()) / 1000 + 7000; //过期时间
				res.data.result.failureTime = failureTime;
				wx.setStorageSync("info", res.data.result);
				that.setData({
					loginStatus: true,
					userInfo: res.data.result
				});
				this.getFollowList() //重新加载订阅数
				that.viewHistory(that.data.currentSize); //获取历史数据
			}
		})
	},
	// 获取订阅数
	getFollowList: function() {
		const that = this;
		var header = {
			'content-type': 'application/x-www-form-urlencoded',
			'token': wx.getStorageSync("info").token
		};
		if (!header.token) {
			return false
		};
		https.getFollowList({
			page: 1,
			type: 1
		}, header).then(res => {
			if (res.data.code == 200) {
				that.setData({
					follow: res.data.result.total == wx.getStorageSync('info').follow ? res.data.result.total : res.data.result
						.total
				})
			}
		})
	},
	//获取观看记录
	viewHistory(currentSize,isHistory) {
		var that = this,
			viewData=isHistory?[]:that.data.viewData,
			header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			};
		https.getHistory({
			page: currentSize
		}, header).then(res => {
			console.log('历史记录', res.data.result.msg.list)
			if (res.data.code == 200) {
				if (res.data.result.msg.list.length > 0) {
					for (let i = 0; i < res.data.result.msg.list.length; i++) {
						viewData.push(res.data.result.msg.list[i])
					}
					that.setData({
						viewData:viewData
					})
				}
				register.loadFinish(that, true);
			} else {
				that.toLogin();
			}
		}).catch(error => {
			console.log(error)
		})
	},
	// 跳转到播放界面
	onGoRoom: function(e) {
		console.log('获取到点击了的按钮', e.detail)
		let that = this;
		for (let i = 0; i < that.data.viewData.length; i++) {
			if (that.data.viewData[i].room_id == e.detail) {
				if (that.data.viewData[i].live_status == 1) {
					wx.navigateTo({
						url: '/pages/play/play?room_id=' + that.data.viewData[i].room_id,
					});
				} else {
					console.log('点击了预约直播', that.data.viewData[i].room_id)
					if (that.data.viewData[i].is_subscribe == 1) {
						wx.showModal({
							title: '温馨提示',
							content: '确定取消预约吗?',
							success(resmodel) {
								if (resmodel.confirm) {
									that.subscribe(that.data.viewData[i].room_id, i)
								} else if (resmodel.cancel) {
									return false;
								}
							}
						})
					} else {
						that.subscribe(that.data.viewData[i].room_id, i)
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
						self.data.viewData[index].is_subscribe = 1;
						self.setData({
							viewData: self.data.viewData //手动修改预约状态
						})
					} else {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						self.data.viewData[index].is_subscribe = 0;
						self.setData({
							viewData: self.data.viewData //手动修改预约状态
						})
					}
				}
			})
		} else {
			console.log('没有登入')
		}
	},
	/**
	 * 生命周期函数--监听页面显示
	 */

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
	},
	// 功能区域按钮
	functionItemBtn:function(e){
		console.log('点击的功能区域',e.currentTarget.dataset.item)
		if(e.currentTarget.dataset.item.name=="我的账户"){
			wx.navigateTo({
				url: '/pages/account/account'
			});
		}else{
			wx.showToast({
				title: '功能正在开发中',
				icon: 'none',
				duration: 2000,
			})
		}
	}
})
