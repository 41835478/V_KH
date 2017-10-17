const app = getApp(),
    queryString = require('../../../utils/queryString'),
    util = require('../../../utils/util'),
    regExpUtil = require('../../../utils/RegExpUtil'),
    utilCommon = require('../../../utils/utilCommon'),
    apiService = require('../../../utils/ApiService'),
    utilPage = app.utilPage;
// {imageUrl: '/images/shop/brooke-lark-203839.png'},
// {imageUrl: '/images/shop/brooke-lark-331977.png'},
// {imageUrl: '/images/shop/brooke-lark-203830.png'}
// 默认数据
const SHOP_PAGES = {
    shopList: [
        {
            img: '/images/shop/eat.png',
            name: '堂食',
            url: '',
            orderType: 0
        },
        {
            img: '/images/shop/takeaway.png',
            name: '外卖',
            url: '',
            orderType: 1
        }
    ],
    topImages: [],
    topInfoList: [
        '暂无公告'
    ]
};
const appPage = {
    data: {
        text: "Page home",
        isShow: false,//进入初始是否刷新数据
        isShareCurrentPage: false,//是否分享首页
        isTableCode: false,//是否带桌台号
        imageServer: app.globalData.serverAddressImg,
        orderUrl: '/pages/shop/order/order',
        topImages: [],//banner图片列表
        shopInfo: {
            lat: 0,
            lng: 0,
            resId: '',
            resLogo: '',
            resName: '',
            resAddress: '',
            resPhone: '',
            resOperation: 0,
            resEndTime: '00:00',
            resStarTime: '00:00',
            resIntro: ''
        },
        specialServiceList: [],//提供服务
        topInfoList: [],
        shopList: [],//店铺就餐方式列表
        memberCardDto: {//会员卡信息
            memberTypeDiscount: 0,//折扣
            memberBalance: 0,//余额
            memberIntegral: 0,//积分
        },
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        console.log('初始化店铺首页_______________________________', options);
        let _this = this;
        let openId = app.globalData.openId,
            token = app.globalData.token,
            resId = options.resId;
        console.log('店铺首页获取openId_______________________________', openId);
        if (!utilCommon.isFalse(openId)) {
            if (!options.resId) {
                app.setLoginRequestPromise();
            }
            app.globalData.loginRequestPromise.then((res) => {
                console.log('店铺首页重新获取openId_______________________________', res);
                openId = app.globalData.openId;
                token = app.globalData.token;
                if (options.resId) {
                    getUserInfo();//分享模式
                } else if (options.q) {//扫码模式
                    app.getQrcodeRid(options);
                    app.getResId((res) => {
                        options.resId = res.value.resId;
                        if (res.value.tableCode && res.value.tableCode.length > 0) {
                            options.tableCode = res.value.tableCode;
                            options.tableName = res.value.tableName;
                            _this.data.isTableCode = true;
                        }
                        getUserInfo();//分享模式
                    })
                } else {
                    util.go('/pages/init/init', {
                        type: 'tab'
                    })
                }

            })
        } else {
            load();
        }

        function getUserInfo() {
            wx.getUserInfo({
                success: function (res) {
                    let userInfo = res.userInfo;
                    app.globalData.userInfo = userInfo;
                    typeof cb == "function" && cb(app.globalData.userInfo);
                    let data = {
                        openId: app.globalData.openId,
                        nikeName: userInfo.nickName,
                        sex: userInfo.gender,
                        headImgUrl: userInfo.avatarUrl,
                        resId: options.resId
                    };
                    app.checkIsFirstUse(data, load);
                }
            });
        }

        function load() {
            apiService.token = token;
            resId = options.resId;
            _this.setData({openId, token, resId});
            _this.getMainInfo(() => {
                let isOrderType = _this.getOrderType(_this.data.shopInfo.restaurantBusinessRules).isOrderType;
                if (_this.data.isTableCode) {
                    if (isOrderType == 0) {
                        goOrderPage();
                    } else if (isOrderType == 3) {
                        apiService.checkHasWaitPayConsumer({
                            openId: app.globalData.openId,
                            tableCode: options.tableCode,
                            resId: resId,
                        }, (rsp) => {
                            if (rsp.code === '2000') {
                                util.go('/pages/order/order-detail/order-detail', {
                                    data: {
                                        tableCode: options.tableCode,
                                        resId: _this.data.resId,
                                        consumerId: rsp.value.consumerId
                                    }
                                });
                            } else if (rsp.code === '2001') {
                                goOrderPage();
                            } else {
                                util.showToast(rsp.message);
                            }
                        });
                    }
                }
            });
            _this.getCommonBannerList();
        }

        function goOrderPage() {
            util.go('/pages/shop/order/order', {
                data: {
                    orderType: 0,
                    resId: _this.data.resId,
                    tableCode: options.tableCode,
                    tableName: options.tableName
                }
            })
        }
    },
    onReady: function () {
        // 页面渲染完成
        this.data.isShow = true;
    },
    onShow: function () {
        // 页面显示
        console.log('店铺首页显示_________________________________________', this.data.isShow);
        if (this.data.isShow) {
            this.getMainInfo();
            this.getCommonBannerList();
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
};

/**
 * 方法类
 */
const methods = {
    /**
     * 获取店铺信息
     */
    getMainInfo(cb) {
        let _this = this, openId = this.data.openId, resId = this.data.resId;
        apiService.getMainInfo({openId, resId}, (res) => {
            let shopList = SHOP_PAGES.shopList,
                shopInfo = res.value.resDetailDto;
            _this.setNavigationBarTitle(shopInfo.resName);
            util.extend(shopList[0], shopInfo.restaurantBusinessRules);//堂食
            util.extend(shopList[1], shopInfo.takeoutBusinessRules);//外卖
            let memberCardDto = res.value.memberCardDto;
            memberCardDto.memberTypeDiscount = util.moneyToFloat(memberCardDto.memberTypeDiscount);//会员折扣
            memberCardDto.memberBalance = util.money(memberCardDto.memberBalance);//会员卡余额
            memberCardDto.memberIntegral = util.moneyToFloat(memberCardDto.memberIntegral);//会员卡积分
            app.globalData.memberCardDtoObj[resId] = memberCardDto;
            let topInfoList = this.data.topInfoList;
            if (res.value.resDetailDto.notice) {
                topInfoList = [];
                topInfoList.push(shopInfo.notice);
            }
            _this.setData({
                shopInfo,//店铺信息
                specialServiceList: res.value.specialServiceList,//店铺服务列表
                shopList,//店铺点餐列表
                memberCardDto,//会员卡信息
                topInfoList
            });
            _this.setShopCartsStorage();
            cb && cb();
        });
    },
    /**
     * 获取banner图片列表
     */
    getCommonBannerList() {
        let _this = this, resId = this.data.resId;
        apiService.getCommonBannerList({resId}, (res) => {
            let topImages = SHOP_PAGES.topImages.concat(res.value);
            _this.setData({
                topImages
            })
        });
    }
};
const events = {
    /**
     * 绑定扫码跳跳堂食点餐页功能
     * @param e
     */
    bindAzmScanCode(e) {
        let _this = this,
            dataset = e.currentTarget.dataset,
            type = dataset.type,
            value = dataset.value,
            url = dataset.url,
            flag = false;
        let isOrderType = this.getOrderType(value).isOrderType;
        if (type === 0 && isOrderType === 3) {
            flag = true;
        }
        if (flag) {
            util.go('/pages/shop/home_scanCode/home_scanCode', {
                data: {
                    resId: _this.data.resId
                }
            });
        } else {
            util.go(url);
        }
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, utilPage));