const App = getApp();
// pages/index.js
import https from '../../utils/https.js';
var register = require('../../utils/refreshLoadRegister.js');
// 地理位置
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
	key: 'YAIBZ-TS2CX-HHU4P-ZZSXQ-LTGU3-5IFYZ' // 必填
});

function compare(a, b) { //版本号比较
	if (a === b) {
		return 0;
	}
	var a_components = a.split(".");
	var b_components = b.split(".");
	var len = Math.min(a_components.length, b_components.length);
	for (var i = 0; i < len; i++) {
		if (parseInt(a_components[i]) > parseInt(b_components[i])) {
			return 1;
		}
		if (parseInt(a_components[i]) < parseInt(b_components[i])) {
			return -1;
		}
	}
	if (a_components.length > b_components.length) {
		return 1;
	}
	if (a_components.length < b_components.length) {
		return -1;
	}
	return 0;
}

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		navHeight: null,
		liveArr: [], //直播间的数据
		currentSize: 1, //当前页数
		allpage: null, //总页数
		num: 0, //推荐关注切换
		isShow: false, //登入显示
		loginNot: false, //没有登入
		followNot: false, //没有关注
		advertArr: [], //广告数据
		locationTxt: '暂未开启定位',
		position: '', //地理位置
		zbhdShow: true, //按钮判断
		Text: "大家都在看"
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {		
		console.log('获取到的数据1===',wx.getLaunchOptionsSync())
		console.log('获取到的数据2===',options)
		var that = this;
		that.getLive(that.data.currentSize)
		wx.getSystemInfo({
			success: (res) => {
				var version = res.version;    //当前设备的版本号
				if (res.platform == "devtools") {
					console.log('pc模拟器', version)
				} else if (res.platform == "ios") {
					console.log('ios', version)
					if (compare(version, '8.2.6') == -1) {
						wx.showModal({
							title: '温馨提示',
							content: '更新你的QQ版本,体验效果会更好哦',
							success(resmodel) {
								if (resmodel.confirm) {
									return false;
								} else if (resmodel.cancel) {
									return false;
								}
							}
						})
					}
				} else if (res.platform == "android") {
					console.log('android', version)
					if (compare(version, '8.2.6') == -1) {
						wx.showModal({
							title: '温馨提示',
							content: '更新你的QQ版本,体验效果会更好哦',
							success(resmodel) {
								if (resmodel.confirm) {
									return false;
								} else if (resmodel.cancel) {
									return false;
								}
							}
						})
					}
				}
			}
		})
		// 计算高度
		that.setData({
			navHeight: App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight
		})
		//初始化下拉刷新加载更多
		register.register(this);
		if (wx.getStorageSync('info')) {
			that.setData({
				isShow: true, //登入显示
				loginNot: false, //没有登入
				followNot: true, //没有关注
				zbhdShow: false
			})
		} else {
			that.setData({
				isShow: true, //登入显示
				loginNot: true, //没有登入
				followNot: false, //没有关注
				zbhdShow: true
			})
		}
	},
	// 重新授权
	toSetting: function() {
		let that = this;
		wx.openSetting({
			success: function(res) {
				console.log(res)
				if (res.authSetting["scope.userLocation"]) {
					that.location()
					if (that.userLocationReadyCallback) {
						that.userLocationReadyCallback(res)
					}
				}
			}
		})
	},
	// 当前的定位
	location: function() {
		let that = this;
		// 初始化定位
		wx.getLocation({
			type: 'gcj02',
			success(res) {
				var location = {
					latitude: res.latitude,
					longitude: res.longitude
				}
				qqmapsdk.reverseGeocoder({
					location: location,
					success: function(res) {
						console.log('获取到的定位', res.result.address)
						that.setData({
							locationTxt: "定位: " + res.result.ad_info.city,
							position: res.result.ad_info.city
						})
						// 重新加载数据
						if (that.data.num == 0) {
							that.getLive(that.data.currentSize, true) //初始化数据
						} else {
							that.getFollowList(that.data.currentSize, true)
						}
					}
				})
			}
		})
	},
	//模拟刷新数据
	refresh: function() {
		this.setData({
			liveArr: [],
			currentSize: 1
		});
		// 重新加载数据
		if (this.data.num == 0) {
			this.getLive(this.data.currentSize);
		} else {
			// 获取关注列表
			this.getFollowList(this.data.currentSize)
		}
	},
	//模拟加载更多数据
	loadMore: function() {
		if (this.data.currentSize < this.data.allpage) {
			let currentSize = this.data.currentSize + 1
			// 重新加载数据
			if (this.data.num == 0) {
				this.getLive(currentSize);
			} else {
				// 获取关注列表
				this.getFollowList(currentSize)
			}
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
	// 点击了按钮
	onSwipeBtn: function(e) {
		// console.log("点击了广告按钮", e.detail)
		if (e.detail.live_status == 1) {
			wx.navigateTo({
				url: '/pages/play/play?room_id=' + e.detail.room_id,
			});
		} else {
			console.log('直播间的状态', e.detail.live_status)
		}
	},
	// 跳转到播放界面
	onGoRoom: function(e) {
		console.log('获取到点击了的按钮', e.detail)
		let that = this;
		for (let i = 0; i < that.data.liveArr.length; i++) {
			if (that.data.liveArr[i].room_id == e.detail) {
				if (that.data.liveArr[i].live_status == 1) {
					wx.navigateTo({
						url: '/pages/play/play?room_id=' + that.data.liveArr[i].room_id,
					});
				} else {
					console.log('点击了预约直播', that.data.liveArr[i].room_id)
					if (that.data.liveArr[i].is_subscribe == 1) {
						wx.showModal({
							title: '温馨提示',
							content: '确定取消预约吗?',
							success(resmodel) {
								if (resmodel.confirm) {
									that.subscribe(that.data.liveArr[i].room_id, i)
								} else if (resmodel.cancel) {
									return false;
								}
							}
						})
					} else {
						that.subscribe(that.data.liveArr[i].room_id, i)
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
				console.log('预约数据',res.data.result.msg)
				if (res.data.code == 200) {
					if (res.data.result.msg == "预约成功") {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						self.data.liveArr[index].is_subscribe = 1;
						self.setData({
							liveArr: self.data.liveArr //手动修改预约状态
						})
					} else {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						self.data.liveArr[index].is_subscribe = 0;
						self.setData({
							liveArr: self.data.liveArr //手动修改预约状态
						})
					}
				}
			})
		} else {
			console.log('没有登入')
		}
	},
	// 分类
	onGoClassification: function(e) {
		// 获取页面传过来的参数
		console.log('获取到的页面参数', e.detail)
		this.setData({
			num: e.detail,
			liveArr: [],
		})
		// 重新加载数据
		if (e.detail == 0) {
			this.getLive(this.data.currentSize);
		} else {
			if (wx.getStorageSync("info")) {
				this.setData({
					isShow: true, //登入显示
					loginNot: false, //没有登入
					followNot: true, //没有关注
					zbhdShow: false
				})
				// 获取关注列表
				this.getFollowList(this.data.currentSize)
			} else {
				this.getLive(this.data.currentSize, true) //初始化数据
			}
		}
	},
	// 跳转去搜索界面
	search: function() {
		wx.navigateTo({
			url: '/pages/search/search',
		});
	},
	// 获取直播栏目列表
	getLive: function(currendSize, isTrue) {
		let self = this,
			liveArr = isTrue ? [] : self.data.liveArr,
			params = {
				page: currendSize,
				area: self.data.position, //地理位置
				u_id: wx.getStorageSync('info').uid ? wx.getStorageSync('info').uid : '' //用户id
			}
		https.live(params).then(res => {
			if (res.data.code == 200) {
				console.log("直播栏目", res.data.result)
				liveArr.push(...res.data.result.list)
				self.setData({
					advertArr: res.data.result.advert, //广告列表
					liveArr: liveArr, //直播列表
					currendSize: res.data.result.page, //当前页数
					allpage: res.data.result.allpage
				})
				register.loadFinish(self, true);
			}
		})
	},
	// 关注列表
	getFollowList: function(currendSize, isTrue) {
		let self = this,
			liveArr = isTrue ? [] : self.data.liveArr,
			params = {
				page: currendSize,
				type:0
			},
			header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			}
			if(header.token){
				https.getFollowList(params, header).then(res => {
					if (res.data.code == 200) {
						console.log("关注列表", res.data.result)
						if (res.data.result.list.length > 0) {
							liveArr.push(...res.data.result.list)
							self.setData({
								liveArr: liveArr, //直播列表
								currendSize: res.data.result.page, //当前页数
								allpage: res.data.result.allpage,
								loginNot: false,
								isShow: false,
								Text: "下拉刷新查更新"
							})
							register.loadFinish(self, true);
						}else{
							self.setData({
								isShow: true,
								Text: "大家都在看"
							})
							self.getLive(self.data.currentSize, true) //初始化数据
						}
					}
				})
			}else {
				self.setData({
					isShow: true,
					Text: "大家都在看"
				})
				self.getLive(self.data.currentSize, true) //初始化数据
			}
	},
	// 登入
	getUserInfo: function(e) {
		let self = this;
		//开始登入
		https.login().then(res => {
			if (res.data.code != 200) {
				console.log('出错了')
			} else {
				let failureTime = Date.parse(new Date()) / 1000 + 7000; //过期时间
				res.data.result.failureTime = failureTime;
				wx.setStorageSync('info', res.data.result); //个人信息
				wx.showToast({
					title: '登入成功',
					icon: 'none',
					duration: 2000,
				})
				// 登入后刷新数据
				self.location()
			}
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
		this.location() //初始化地理位置和列表
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
