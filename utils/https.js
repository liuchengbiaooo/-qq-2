const config = require('config.js'); // 你的域名
import apiList from './apiList' // 引入apiList.js文件

const apiRequest = (url, method, data, header) => { //接收所需要的参数，如果不够还可以自己自定义参数
	let promise = new Promise(function(resolve, reject) {
		wx.request({
			url: config.serverUrl + url,
			data: data ? data : null,
			method: method,
			header: header ? header : {
				'content-type': 'application/x-www-form-urlencoded'
			},
			success: function(res) {
				//接口调用成功
				resolve(res); //根据业务需要resolve接口返回的json的数据
			},
			fail: function(res) {
				// fail调用接口失败
				reject({
					errormsg: '遇到错误,请稍后重试',
					code: -1
				});
			}
		})
	});
	return promise; //注意，这里返回的是promise对象
}

//登入授权
let login = () => {
	return new Promise((resolve, reject) => {
		//判断是否获取授权
		wx.getSetting({
			success(res) {
				if (res.authSetting['scope.userInfo']) {
					// 已经授权，可以直接调用 getUserInfo 获取头像昵称
					wx.login({
						provider: 'qq',
						success: function(loginRes) {
							// 获取登入code
							var code = loginRes.code;
							wx.getUserInfo({
								success(res) {
									// console.log("获取用户信息成功", res)
									// 获取用户信息后向调用信息更新方法
									var enc_data = res.encryptedData;
									var iv = res.iv;
									//将用户登录code传递到后台置换用户SessionKey、OpenId等信息
									var params = {
										code: code,
										enc_data: enc_data,
										iv: iv
									};
									// 执行回调
									resolve(apiRequest(apiList.login, 'get', params))
								},
								fail(res) {
									console.log("获取用户信息失败", res)
								}
							})
						}
					})
				} 
			}
		})
	})
}

// api--------------------------------------------------------------------------------

// 栏目直播列表
let live = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.live, 'get', data))
	})
}
//榜单列表
let rank = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.rank, 'get', data))
	})
}

// 获取鉴权签名
let sign = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.sign, 'get', data))
	})
}

// 房间状态
let room = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.room, 'get', data))
	})
}

// 关注取消
let follow = (data, header) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.follow, 'get', data, header))
	})
}

//点赞
let doZan = (data, header) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.doZan, 'get', data, header))
	})
}

//获取关注栏目列表
let getFollowList = (data, header) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getFollowList, 'get', data, header))
	})
}

// 点歌卡
let doSongCard = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.doSongCard, 'get', data))
	})
}
//观看记录
let getHistory = (data, header) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getHistory, 'get', data, header))
	})
};

//预约
let subscribe = (data, header) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.subscribe, 'get', data, header))
	})
};

// 投票
let doVote = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.doVote, 'get', data))
	})
}

// 竞猜
let doGuess = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.doGuess, 'get', data))
	})
}

// 搜索关键字
let getSearchKeysword = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getSearchKeysword, 'get', data))
	})
}

// 搜索
let search = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.search, 'get', data))
	})
}

// 栏目
let getColumn = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getColumn, 'get', data))
	})
}
// 频率
let getChannel = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getChannel, 'get', data))
	})
}
// 广播
let getStation = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getStation, 'get', data))
	})
}
//当前热度
let getColumnHot = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getColumnHot, 'get', data))
	})
}
//参与人数
let joinNum = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.joinNum, 'get', data))
	})
}
//热门搜索
let getHotSearch = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.getHotSearch, 'get', data))
	})
}
//猜你喜欢
let recommend = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.recommend, 'get', data))
	})
}
//添加历史记录
let history = (data) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.history, 'get', data))
	})
}
//批量预约
let batch = (data, header) => {
	return new Promise((resolve, reject) => {
		resolve(apiRequest(apiList.batch, 'get', data, header))
	})
}

// api--------------------------------------------------------------------------------

//公共函数-----------------------------------------------------------------------------
// 查出下一次日期
function sevenDays(day) {
	var sevenDayArr = []
	var weekDay = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
	for (var i = 0; i < 7; i++) { //执行数据
		var obj = {
			date: getDay(i),
			week: weekDay[new Date(getDay(i)).getDay()]
		}
		sevenDayArr.push(obj)
	}
	// 查出日期
	for (var i = 0; i < sevenDayArr.length; i++) {
		if (sevenDayArr[i].week == day) {
			return sevenDayArr[i].date
		}
	}
}
//天数
function getDay(day) {
	var today = new Date();
	var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
	today.setTime(targetday_milliseconds); //注意，这行是关键代码
	var tYear = today.getFullYear();
	var tMonth = today.getMonth();
	var tDate = today.getDate();
	tMonth = doHandleMonth(tMonth + 1);
	tDate = doHandleMonth(tDate);
	return tYear + "-" + tMonth + "-" + tDate;
}
//月份
function doHandleMonth(month) {
	var m = month;
	if (month.toString().length == 1) {
		m = "0" + month;
	}
	return m;
}
//公共函数-----------------------------------------------------------------------------

//最后需要将具体调用的函数暴露出，给具体业务调用
export default {
	config: config, //配置信息
	// api
	login: login, //授权登入
	live: live, //直播栏目
	sign: sign, // 获取鉴权签名
	rank: rank, //榜单
	room: room, //房间状态
	follow: follow, //关注取消
	getFollowList: getFollowList, //关注列表
	doSongCard: doSongCard, //点歌卡
	doVote: doVote, //投票
	getHistory: getHistory, //获取足迹列表
	subscribe: subscribe, //预约
	doGuess: doGuess, //竞猜
	getSearchKeysword: getSearchKeysword, //搜索关键字
	search: search, //搜索
	doZan: doZan, //点赞
	getColumn: getColumn, //栏目
	getChannel: getChannel, //频率
	getStation: getStation, //广播
	getColumnHot: getColumnHot, //热度
	joinNum: joinNum, //参与人数
	getHotSearch: getHotSearch, //热门搜索
	recommend: recommend, //猜你喜欢
	history: history, //历史记录
	batch: batch, //批量预约
	// 公共函数
	sevenDays:sevenDays, //根据星期查出后七天的日期
	getDay:getDay,//查询后几天日期
}
