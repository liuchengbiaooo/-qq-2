// pages/find/find.js
const App = getApp();
import https from '../../utils/https.js';

var register = require('../../utils/refreshLoadRegister.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		navHeight: null,
		selectType: '1', //榜单类型，默认是热度 2是订阅
		listData: [],
		topData: '',
		timeDown: false,
		currentSize: 1,
		append: '',
		downLoadState: false,
		resPage: '',
		rankArr:[],
		arr:[],
		allpage:null,//总页数
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
		this.getRankData(that.data.selectType,that.data.currentSize);
		//初始化下拉刷新加载更多
		register.register(this);
	},
	//模拟刷新数据
	refresh: function() {
		console.log('刷新数据')
		this.setData({
			currentSize: 1,
			listData: []
		});
		this.getRankData(this.data.selectType,this.data.currentSize);
	},
	//模拟加载更多数据
	loadMore: function() {
		if (this.data.currentSize < this.data.allpage) {
			let currentSize = this.data.currentSize + 1
			this.setData({
				currentSize: currentSize
			});
			// 重新加载数
			this.getRankData(this.data.selectType,currentSize);
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
	frashData() {
		this.setData({
			currentSize: 1,
			listData: []
		});
		this.getRankData(this.data.selectType,this.data.currentSize);
	},
	onChooseList(e) {
		this.setData({
			selectType: e.detail == "subscribe" ? 2 : 1,
			rankArr:[],
			arr:[]
		})
		this.getRankData(e.detail == "subscribe" ? 2 : 1,this.data.currentSize)
	},
	getRankData: function(select,currentSize) {
		const that = this;
		var arr = that.data.arr,
			rankArr=that.data.rankArr,
			item = '';
		var params = {
			page: currentSize,
			order: select ? select : that.data.selectType,
			u_id: wx.getStorageSync('info').uid
		}
		https.rank(params).then(res => {
			//  加载状态 false ，即可再次，请求
			that.data.downLoadState = false;
			if (res.data.code == 200) {
				if (currentSize == 1) {
					arr = res.data.result.list.splice(0, 3);
					item = arr[0];
					arr[0] = arr[1];
					arr[1] = item;
					switch (arr.length) {
						case 0:
							for (var i = 0; i < 3; i++) {
								arr.push({}); //2
							}
							break;
						case 1:
							for (var i = 0; i < 2; i++) {
								arr.push({}); //2
							}
							break;
						case 2:
							arr.push({}); //1
							break;
					}
					if (res.data.result.list.length >0) {
						for (let i = 0; i < res.data.result.list.length; i++) {
							rankArr.push(res.data.result.list[i]);
						}
					}
					that.setData({
						topData:arr,
						listData:rankArr,
						currendSize: res.data.result.page, //当前页数
						allpage: res.data.result.allpage
					})
					register.loadFinish(that, true);
				}else{
					if (res.data.result.list.length >0) {
						for (let i = 0; i < res.data.result.list.length; i++) {
							rankArr.push(res.data.result.list[i]);
						}
					} 
					that.setData({
						listData:rankArr,
						currendSize: res.data.result.page, //当前页数
						allpage: res.data.result.allpage
					})
					register.loadFinish(that, true);
				}
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
		// this.getRankData(this.data.selectType?this.data.selectType:'1');
		this.onLoad()
	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {
		// console.log('隐藏了')
		this.setData({
			timeDown: true
		})
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
