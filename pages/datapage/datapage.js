// pages/datapage/datapage.js
import https from "../../utils/https";
const App = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		navHeight: null,
		info:null,
		pageTitle: '栏目主页',
		pageType: '1', //1栏目 2频率 3广播
		pageId: '',
		pageData: '',
		channelid: '',
		stationid: '',
		moreStatus: false,
		isTopten: true,
		isFm: false, //直播流
		homeBack:false,//跳转回主页
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		let pages = getCurrentPages();
		    let currPage = null;
		    if (pages.length) {
		      currPage = pages[pages.length-2];
		    }
		//获取当前页面的前一页面的路由
		if(currPage.route=='pages/play/play' ||  currPage.route == 'pages/search/search' || currPage.route == 'pages/footprint/footprint'){
			console.log('是从播放页面进入的')
			that.setData({
				homeBack:true
			})
		}
		// 用户信息
		if (wx.getStorageSync('info')) {
			that.setData({
				info: wx.getStorageSync('info')
			})
		}
		// 计算高度
		that.setData({
			navHeight: App.globalSystemInfo.navBarHeight + App.globalSystemInfo.navBarExtendHeight,
			pageId: options.colid ? options.colid : '',
			channelid: options.channelid ? options.channelid : '',
			pageType: options.pageType ? options.pageType : '1',
			stationid: options.stationid ? options.stationid : '',
			pageTitle: options.pageType == 1 ? '栏目主页' : options.pageType == 2 ? '频率主页' : options.pageType == 3 ? '广播主页' : '',
			isFm: options.isFm=='true'? true : false
		})
		if (options.isFm=="true") {
			that.topPlay() //执行上一级的更改
		}
		that.getPageData()
	},
	// 执行上一界面的方法
	topPlay() {
		this.videoContext = wx.createVideoContext('videoplayer');
		this.videoContext.play() //播放视频
		this.getColumn(this.data.pageId)
	},
	// 获取栏目详情
	getColumn: function(room_id) {
		// 关注
		let self = this,
			params = {
				c_id: room_id
			}
		https.getColumn(params).then(res => {
			if (res.data.code == 200) {
				self.setData({
					Fm_urls: res.data.result.Fm_urls //直播流
				})
			}
		})
	},
	//pageType=2去频率页 3是去广播页面
	toPinlv(e) {
		console.log(e);
		const that = this;
		switch (Number(that.data.pageType)) {
			case 1:
				wx.navigateTo({
					url: '/pages/datapage/datapage?pageType=2&channelid=' + e.currentTarget.dataset.channel
				});
				break;
			case 2:
				wx.navigateTo({
					url: '/pages/datapage/datapage?pageType=3&stationid=' + e.currentTarget.dataset.station
				});
				break;
		}
	},
	//获取栏目pageType=1，频率pageType=2，广播页面pageType=3
	getPageData() {
		const that = this;
		let params = {
			u_id: wx.getStorageSync('info').uid,
			c_id: that.data.pageId
		}
		switch (Number(that.data.pageType)) {
			case 1:
				https.getColumn(params).then(res => { //栏目
					console.log(res.data.result)
					if (res.data.code == 200) {
						that.setData({
							pageData: res.data.result
						})
					}
				})
				break;
			case 2:
				that.data.pageData = {}
				https.getChannel({
					ch_id: that.data.channelid,
					u_id: wx.getStorageSync('info').uid
				}).then(res => { //频率
					if (res.data.code == 200) {
						that.setData({
							pageData: res.data.result
						})
					}
				})
				break;
			case 3:
				that.data.pageData = {}
				https.getStation({
					s_id: that.data.stationid
				}).then(res => { //广播
					if (res.data.code == 200) {
						that.setData({
							pageData: res.data.result
						})
					}
				})
				break;
		}
	},

	//订阅
	order_column(e) {
		const that = this;
		var header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			},
			data = {
				type: 2,
				ac_id: e.currentTarget.dataset.columnid //栏目id
			};
		if(header.token){
			https.follow(data, header).then(res => {
				if (res.data.code == 200) {
					that.setData({
						orderTitle: '已订阅',
						orderStatus: 'ordered'
					});
					that.getPageData();
				}
			})
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
				let failureTime=Date.parse(new Date()) / 1000 + 7000;  //过期时间
				res.data.result.failureTime=failureTime;
				wx.setStorageSync('info', res.data.result);   //个人信息
			}
		})
	},

	//栏目跳转直播间 status = 1正在直播，跳到直播间
	//status=2 可以预约
	columntoplay(e) {
		const that = this,
			header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			};
		switch (Number(e.currentTarget.dataset.status)) {
			case 1:
				if(that.data.homeBack){
					that.handlerGobackClick()
				}else{
					wx.navigateTo({
						url: '/pages/play/play?room_id=' +e.currentTarget.dataset.item.room_id
					});
				}
				break;
			case 2:
				if(!header.token){
					return false;
				}
				https.subscribe({
					c_id: e.currentTarget.dataset.id,
					uid: wx.getStorageSync('info').uid
				}, header).then(res => {
					if (res.data.code == 200) {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						that.getPageData()
					}
				}).catch(error => {
					console.log(error);
				});
				break;
		}
		console.log(e)
	},
	//栏目跳转直播间 status = 1正在直播，跳到直播间
	//status=2 可以预约
	pinlvtoplay(e) {
		const that = this,
			header = {
				'content-type': 'application/x-www-form-urlencoded',
				'token': wx.getStorageSync("info").token
			};
		switch (Number(e.currentTarget.dataset.status)) {
			case 1:
				if(that.data.homeBack){
					that.handlerGobackClick()
				}else{
					wx.navigateTo({
						url: '/pages/play/play?room_id=' +e.currentTarget.dataset.item.room_id
					});
				}
				break;
			case 2:
				if(!header.token){
					return false;
				}
				https.subscribe({
					c_id: e.currentTarget.dataset.id,
					uid: wx.getStorageSync('info').uid
				}, header).then(res => {
					// console.log(res)
					if (res.data.code == 200) {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						that.getPageData()
					}
				}).catch(error => {
					console.log(error);
				});
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
		this.setData({
			isFm: false
		})
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
			title:'电台直播-国内专业音频分享平台,随时随地,听我想听！',
			desc: '听你想听,尽在其中',
			imageUrl:'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/1.jpeg',//这是图片
			path: 'pages/index/index' //这是一个路径
		}
	},
	// 返回上一级
	handlerGobackClick: function() {
		wx.navigateBack({
			delta: 1
		})
	},
	handlerGohomeClick: function() {
		wx.switchTab({
			url:"/pages/index/index"
		})
	}
})
