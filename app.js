App({
  globalData: {
    openId: '',
    token: '',
    userInfo: {},
    session_key: '',
    takeawayCarts: [],//外卖购物车
    takeawayAmount: 0,  //外卖菜品总价
    takeawayCount: 0,//外卖菜品总量
    hallCarts: [],//堂食购物车
    hallAmount: 0,//堂食菜品总价
    hallCount: 0, //堂食菜品总量
    // baseUrl:"https://b.zhenler.com",
    // baseUrl:"http://192.168.134.169/zhenler-server",
    serverAddress: 'https://vip.zhenler.com/api/',
    //serverAddress: 'http://192.168.134.254:8080/zhenler-server/api/',
    //serverAddress: 'http://192.168.134.253:8080/zhenler-server/api/',
    serverAddressImg: 'http://f.zhenler.com',
  }
});