// pages/components/zbhd-box/zbhdbox.js
import https from '../../../utils/https.js';

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		itemData: Object,
		zbhdShow: {
			type: Boolean,
			value: true
		}
	},
	/**
	 * 组件的初始数据
	 */
	data: {
		zbhdData: []
	},
	attached() {
		if (this.data.itemData.nextDate == '每日') { //栏目每天
			var a = new Array("日", "一", "二", "三", "四", "五", "六"),
				week = new Date().getDay(),
				str = https.sevenDays("星期" + a[week]).replace(/-/g, '/') + ' ' + this.data.itemData.nextStartTime, //拼接下次直播的时间
				date1 = new Date(str).valueOf(), //下次直播的时间戳
				date2 = new Date().valueOf(); //当前的时间戳
			if (date2 <= date1) { //判断下次直播是明天还是今天
				this.data.itemData.nextDate = '今天'
			} else {
				this.data.itemData.nextDate = '明天'
			}
		} else if (this.data.itemData.nextDate == '今日') { //栏目今天
			this.data.itemData.nextDate = '今天'
		} else {
			if (https.sevenDays(this.data.itemData.nextDate) == https.getDay(1)) { //栏目明天
				this.data.itemData.nextDate = '明天'
			} else {
				this.data.itemData.nextDate = https.sevenDays(this.data.itemData.nextDate) //将星期转为日期
			}
		}
		this.setData({
			zbhdData: this.data.itemData
		})
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		goPlay: function() {
			if (this.data.itemData.live_status == 1) {
				this.goRoom()
			} else {
				return;
			}
		},
		// 执行跳转到房间
		goRoom: function() {
			this.triggerEvent('goRoom', this.data.itemData.room_id)
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
					// 执行预约
					self.triggerEvent('goRoom', self.data.itemData.room_id)
				}
			})
		},
		iconBtn: function() {
			wx.navigateTo({
				url: '/pages/datapage/datapage?pageType=1&colid=' + this.data.itemData.room_id
			})
		}
	}
})
