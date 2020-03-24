// pages/search/search.js
const App = getApp();
// 引入https
import https from '../../utils/https';

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		navHeight: null,
		// 搜索推荐
		searchTui: [],
		// 搜索历史
		searchLisi: [],
		resultShow: true, //结果页面
		cruxShow: true,   //关键字页面
		recommendArr: [], //默认猜你喜欢
		cruxArr: [],   //关键字数据
		resultObj: {}, //结果页数据
		zbhdShow: true,
		resultItem:[],//数据
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
		// 获取搜索
		this.getSearch()
		// 列表
		this.recommend()
		//热门搜索
		this.getHotSearch()
		// 是否登入
		if (wx.getStorageSync('info')) {
			that.setData({
				zbhdShow: false
			})
		} else {
			that.setData({
				zbhdShow: true
			})
		}
	},
	// 获取猜你喜欢列表
	recommend: function() {
		let self = this,
			params = {
				page: 1
			}
		https.recommend(params).then(res => {
			if (res.data.code == 200) {
				self.setData({
					recommendArr: res.data.result.list //直播列表
				})
			}
		})
	},
	//热门搜索
	getHotSearch: function() {
		let self = this,
			params = {
				page: 1
			},
			searchTui=[]
		https.getHotSearch(params).then(res => {
			if (res.data.code == 200) {
				console.log('热门搜索',res.data.result)
				for (var i=0;i<res.data.result.length;i++) {          //过滤没有开播的
					// if(res.data.result[i].live_status!=0){
						searchTui.push(res.data.result[i])
					// }
				}
				self.setData({
					searchTui: searchTui
				})
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
			title:'电台直播-国内专业音频分享平台,随时随地,听我想听！',
			desc: '听你想听,尽在其中',
			imageUrl:'https://bkt-common-wxapp-1254255441.cos.ap-guangzhou.myqcloud.com/play/1.jpeg',//这是图片
			path: 'pages/index/index' //这是一个路径
		}
	},
	// 跳转到播放界面
	onGoRoom: function(e) {
		let that = this,
			newArr = that.data.recommendArr			 //默认
		if (!that.data.resultShow) {
			console.log('结果页数据')
			newArr = that.data.resultObj.column
		} 
		if (!that.data.cruxShow) {
			console.log('关键字页数据')
			newArr = that.data.cruxArr
		} 
		for (let i = 0; i < newArr.length; i++) {
			if (newArr[i].room_id == e.detail) {
				if (newArr[i].live_status == 1) {
					wx.navigateTo({
						url: '/pages/play/play?room_id=' + newArr[i].room_id,
					});
				} else {
					if (newArr[i].is_subscribe == 1) {
						wx.showModal({
							title: '温馨提示',
							content: '确定取消预约吗?',
							success(resmodel) {
								if (resmodel.confirm) {
									that.subscribe(newArr[i].room_id, i)
								} else if (resmodel.cancel) {
									return false;
								}
							}
						})
					} else {
						that.subscribe(newArr[i].room_id, i)
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
				if (res.data.code == 200) {
					if (res.data.result.msg == "预约成功") {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						if (!self.data.resultShow) {
							console.log('结果页数据')
							self.data.resultObj.column[index].is_subscribe = 1;
							self.setData({
								resultObj: self.data.resultObj //手动修改预约状态
							})
						}else if (!self.data.cruxShow) {
							console.log('关键字页数据')
							self.data.cruxArr[index].is_subscribe = 1;
							self.setData({
								cruxArr: self.data.cruxArr //手动修改预约状态
							})
						}else{
							console.log('正常页数据')
							self.data.recommendArr[index].is_subscribe = 1;
							self.setData({
								recommendArr: self.data.recommendArr //手动修改预约状态
							})
						}
					} else {
						wx.showToast({
							title: res.data.result.msg,
							icon: 'none',
							duration: 2000,
						})
						if (!self.data.resultShow) {
							console.log('结果页数据')
							self.data.resultObj.column[index].is_subscribe = 0;
							self.setData({
								resultObj: self.data.resultObj //手动修改预约状态
							})
						}else if (!self.data.cruxShow) {
							console.log('关键字页数据')
							self.data.cruxArr[index].is_subscribe = 0;
							self.setData({
								cruxArr: self.data.cruxArr //手动修改预约状态
							})
						}else{
							console.log('正常页数据')
							self.data.recommendArr[index].is_subscribe = 0;
							self.setData({
								recommendArr: self.data.recommendArr //手动修改预约状态
							})
						}
					}
				}
			})
		} else {
			console.log('没登入')
		}
	},
	cancel: function() {
		console.log('清空历史')
		wx.clearStorageSync("searchLisi")
		this.setData({
			searchLisi: []
		})
	},
	// 搜索过的
	search_item_btn: function(data) {
		console.log("点击搜索过的", data.currentTarget.dataset.item);
		var obj = {
			detail: data.currentTarget.dataset.item
		}
		this.onSendCon(obj)
	},
	// 热门搜索
	search_item_box_item: function(data) {
		console.log("点击热门搜索", data.currentTarget.dataset.item);
		// wx.navigateTo({
		// 	url: '/pages/play/play?item=' + JSON.stringify(data.currentTarget.dataset.item),
		// });
		var obj = {
			detail: data.currentTarget.dataset.item.SearchName
		}
		this.onSendCon(obj)
	},
	// 返回上一级
	handlerGobackClick: function() {
		wx.navigateBack({
			delta: 1
		})
	},
	onCancel: function() {
		console.log("清空数据")
		this.setData({
			resultShow: true, //结果页面
			cruxShow: true //关键字页面
		})
	},
	// 输入
	onInput: function(data) {
		console.log('获取到的数据', data.detail)
		if (data.detail == '') {
			this.onCancel()
			return false;
		}
		let self = this,
			params = {
				search: data.detail
			}
		https.getSearchKeysword(params).then(res => {
			console.log(res)
			if (res.data.code == 200) {
				console.log("关键字列表", res.data.result)
				if (res.data.result.length == 0) {
					wx.showToast({
						title: '当前没有结果',
						icon: 'none',
						duration: 2000
					})
				} else {
					self.setData({
						cruxShow: false,
						cruxArr: res.data.result
					})
				}
			}
		})
	},
	// 发送
	onSendCon: function(data) {
		console.log('发送数据', data.detail)
		if (data.detail == '') {
			return false;
		}
		let self = this,
			searchLisi = self.data.searchLisi,
			params = {
				search: data.detail
			}
		https.search(params).then(res => {
			if (res.data.code == 200) {
				if (res.data.result.anchor.length == 0 && res.data.result.column.length == 0) {
					wx.showToast({
						title: '当前没有结果',
						icon: 'none',
						duration: 2000
					})
				} else {
					console.log("结果列表", res.data.result)
					searchLisi.push(data.detail)
					const rem = new Map();
					searchLisi = searchLisi.filter((a) => !rem.has(a) && rem.set(a, 1)); //数组去重
					wx.setStorageSync('searchLisi', JSON.stringify(searchLisi)); //个人信息
					self.setData({
						resultShow: false,
						searchLisi: searchLisi,
						resultObj: res.data.result
					})
					let num={detail:0}  //默认全部数据
					self.onSearchItem(num)
				}
			}
		})
	},
	// 选择数据
	onSearchItem:function(num){
		console.log('获取到的全部数据',this.data.resultObj)
		var num=num.detail,  //切换数据
			newresultItem=[],//当前显示的数据
			resultObj=this.data.resultObj;//总数据
		if(num==1){
			newresultItem.push(...resultObj.column)      //栏目
		}else if(num==2){
			// newresultItem.push(...resultObj.column)   //频率
		}else if(num==3){
			// newresultItem.push(...resultObj.column)   //广播
		}else{
			newresultItem.push(...resultObj.column)      //栏目
		}
		this.setData({
			resultItem:newresultItem
		})
	},
	//初始化搜索结果
	getSearch: function() {
		if (wx.getStorageSync("searchLisi")) {
			console.log('获取到的初始搜索结果', JSON.parse(wx.getStorageSync("searchLisi")))
			this.setData({
				searchLisi: (JSON.parse(wx.getStorageSync("searchLisi"))).reverse()
			})
		}
	}
})
