const api = {
  login: '/Login', //登录
  follow: '/Person/follow', //关注
  search: '/Live/search', //搜索
  live: '/Live', //栏目直播列表
  getFollowList: '/Person/getFollowList', //用户关注栏目列表
  getHistory: '/Person/getHistory', //用户访问栏目足迹
  getSearchKeysword: '/Live/getSearchKeysword', //获取搜索关键字
  sign: '/Sign', //获取鉴权签名
  rank: '/Rank', //榜单
  room:'/Room',//房间状态
  doSongCard:'/Room/doSongCard', //点歌卡
  doVote:'/Room/doVote', //投票
  subscribe:'/Person/subscribe',//预约
  doGuess:'/Room/doGuess',  //竞猜
  getColumn:'/Live/getColumn',//栏目主页
  getStation:'/Live/getStation',//广播主页
  getChannel:'/Live/getChannel',//频率主页
  doZan:"/Person/doZan",//点赞
  getColumnHot:"/Room/getColumnHot",//当前房间的热度
  joinNum:'/Room/joinNum',//参与人数
  getHotSearch:'/Live/getHotSearch',//热门搜索
  recommend:'/Live/recommend',//猜你喜欢
  history:'/Live/history',//访问栏目足迹
  batch:'/Person/batch',//批量预约
}
export default api;
