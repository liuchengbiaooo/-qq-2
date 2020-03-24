// pages/components/rank-list/ranklist.js
import https from "../../../utils/https";

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		listData: Array,
		topData: {
			type: Array
		},
		allData: {
			type: Array
		},
		select: String,
		timeStatus: Boolean
	},
	observers: {

	},
	/**
	 * 组件的初始数据
	 */
	data: {
		//时分秒
		hours: '',
		minutes: '',
		seconds: '',
		timer: '',
		tipsStatus: false,
		tipsCon: '排行榜每天早上00:00点更新',
		tipleft: '',
		tiptop: '',
		orderTitle: '订阅',
		orderStatus: 'order_colbtn',
		col_id: '',
	},
	ready(e) {
		// console.log(this.data)
		// console.log(this.data.topData)
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		showTips(e) {
			const that = this;
			clearTimeout();
			that.setData({
				tipsStatus: true,
				tipleft: 50 + e.detail.x,
				tiptop: e.detail.y
			});
			setTimeout(function() {
				that.setData({
					tipsStatus: false
				});
			}, 1600);

		},
		tologin() {
			const that = this;
			https.login().then(res => {
				if (res.data.code == 200) {
					let failureTime = Date.parse(new Date()) / 1000 + 7000; //过期时间
					res.data.result.failureTime = failureTime;
					wx.setStorageSync("info", res.data.result);
				}
			}).catch(err => {
				that.tologin();
			})
		},
		// 订阅按钮
		order_column1(e) {
			let columnid = e.currentTarget.dataset.columnid,
				fol = e.currentTarget.dataset.fol,
				index = e.currentTarget.dataset.index
			this.order_column(columnid, index, fol,true)
		},
		order_column2(e) {
			let columnid = e.currentTarget.dataset.columnid,
				fol = e.currentTarget.dataset.fol,
				index = e.currentTarget.dataset.index
			this.order_column(columnid, index, fol,false)
		},
		order_column(columnid, index, fol, isOrder) {
			const that = this;
			if (!wx.getStorageSync('info')) {
				console.log('没有登录');
				wx.showModal({
					title: '温馨提示',
					content: '您还没有登录，请先登录',
					success(rel) {
						console.log(rel);
						if (rel.confirm) {
							wx.reLaunch({
								url: '/pages/me/me?from=list'
							})
						} else if (rel.cancel) {
							return;
						}
					}
				})
			} else {
				that.setData({
					col_id: columnid
				})
				if (isOrder) {
					if(that.data.topData[index].is_follow==1){
						wx.showModal({
							title: '温馨提示',
							content: '确定取消订阅吗?',
							success(resmodel) {
								if (resmodel.confirm) {
									that.order_request(columnid,isOrder,index)
								} else if (resmodel.cancel) {
									return;
								}
							}
						})
					}else{
						console.log(columnid)
						that.order_request(columnid,isOrder,index)
					}
				}else{
					if(that.data.listData[index].is_follow==1){
						wx.showModal({
							title: '温馨提示',
							content: '确定取消订阅吗?',
							success(resmodel) {
								if (resmodel.confirm) {
									that.order_request(columnid,isOrder,index)
								} else if (resmodel.cancel) {
									return;
								}
							}
						})
					}else{
						console.log(columnid)
						that.order_request(columnid,isOrder,index)
					}
				}	
			}
		},
		toColumnIndex(e) {
			if (e.currentTarget.dataset.col) {
				wx.navigateTo({
					url: '/pages/datapage/datapage?pageType=1&colid=' + e.currentTarget.dataset.col
				})
			} else {
				return
			}
		},
		order_request(columnid,isOrder,index) {
			const that = this;
			var header = {
					'content-type': 'application/x-www-form-urlencoded',
					'token': wx.getStorageSync("info").token
				},
				data = {
					type: 2,
					ac_id: columnid //栏目id
				};
			let promise = new Promise(function(resolve, reject) {
				https.follow(data, header).then(res => {
					if (res.data.code == 200) {
						if(res.data.result.msg=='关注成功'){
							if (isOrder) {
								that.data.topData[index].is_follow = 1;
								that.setData({
									topData: that.data.topData
								});
							} else {
								that.data.listData[index].is_follow = 1;
								that.setData({
									listData: that.data.listData
								});
							}
						}else{
							if (isOrder) {
								that.data.topData[index].is_follow = 0;
								that.setData({
									topData: that.data.topData
								});
							} else {
								that.data.listData[index].is_follow = 0;
								that.setData({
									listData: that.data.listData
								});
							}
						}
					} else {
						that.tologin();
						that.order_request(that.data.col_id)
					}
				})
			})
			return promise;
		}
		// timeDown(){
		//   const that = this;

		//   var nowDate = new Date().getTime();

		//   var endDate = new Date();
		//   endDate = endDate.setHours(23, 59, 59, 999);

		//   var totalSeconds = parseInt((endDate - nowDate) / 1000);
		//   var modulo = totalSeconds % (60 * 60 * 24);
		//   //小时数
		//   var hours = Math.floor(modulo / (60 * 60));
		//   modulo = modulo % (60 * 60);
		//   //分钟
		//   var minutes = Math.floor(modulo / 60);
		//   //秒
		//   var seconds = modulo % 60;

		//   that.setData({
		//     hours: hours,
		//     minutes: minutes,
		//     seconds: seconds
		//   })
		//   that.timer = setTimeout(function(){
		//     that.timeDown();
		//   },1000);
		// }
	}
})
