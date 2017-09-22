const appUtil = require('../../../utils/appUtil.js'),
    util = require('../../../utils/util.js'),
    utilCommon = require('../../../utils/utilCommon'),
    utilPage = require('../../../utils/utilPage'),
    apiService = require('../../../utils/ApiService'),
    app = getApp();
const page = {
    data: {
        text: '确认订单',
        isShow: false,//进入初始是否刷新数据
        imageServer: app.globalData.serverAddressImg,//图片服务器地址
        orderType: 0,//0：堂食  1：外卖,
        orderList: ['hall', 'takeaway'],//hall：堂食  takeaway：外卖,
        shopCarts: [],//购物车信息
        usersubarea: 0,
        usersubareaCon: 0,
        fancyboxActive: '',
        consumerId: null,
        consumerData: '',
        amount: '',
        count: '',
        diningNumber: 1,
        youhui: '',
        serviceChange: 0,
        serviceChangeName: "茶位费",

        hasTableCode: false,
        tableDetail: {},
        tableDtoList: {},
        hasTable: false,

        note: "",//备注信息
        otherList: {},
        totalPrice: 0,//总金额
        discountPrice: 0,//折扣后价钱
        otherFees: {
            name: '',
            counts: null,
            price: 0,
            totalPrice: 0
        },

        //外卖
        loadDefault: null,
        DefaultAddress: false,
    },
    onLoad: function (options) {
        let _this = this,
            openId = app.globalData.openId,
            token = app.globalData.token,
            resId = options.resId,
            orderList = this.data.orderList,
            orderType = Number(options.orderType),
            shopCartsInfo = app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'],
            shopCart = shopCartsInfo.list,
            totalPrice = shopCartsInfo.totalPrice,
            counts = shopCartsInfo.counts,
            amount = shopCartsInfo.amount,
            otherList = shopCartsInfo.otherList,
            userOrderInfo = app.globalData.userOrderInfo || {},
            consumerId = userOrderInfo.consumerId || '';
        apiService.token = token;
        console.log(userOrderInfo);
        _this.setData({
            openId,
            token,
            resId,
            orderType,
            consumerId,
            shopCart,
            shopCartsInfo,
            totalPrice,
            otherList
        });
        if (orderType == 1) {
            _this.setNavigationBarTitle('外卖 - ' + _this.data.text);
            _this.setLoadDefaultAddress();
        } else {
            _this.setNavigationBarTitle('堂食 - ' + _this.data.text);
            _this.data.tableDetail.name = "请选择桌台";
            //判断有桌子就显示桌子，没桌子就手动填入桌子号
            if (userOrderInfo.tableCode && userOrderInfo.tableCode.length > 0) {
                let diningNumber = userOrderInfo.fNumber || 1;
                _this.setData({
                    tableDetail: userOrderInfo,
                    diningNumber,
                    hasTable: true,
                    hasConsumerId: true
                });
            } else {
                _this.setData({tableDetail: _this.data.tableDetail});
            }
        }

        wx.getSystemInfo({
            success: function (res) {
                _this.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
        /**
         * 设置店铺详情
         */
        let memberCardDto = app.globalData.memberCardDto;
        this.setResDetail(() => {
            // 全局数据获取  购物车 购物车总价、总数
            _this.setData({
                consumerData: shopCartsInfo.list,
                amount: shopCartsInfo.amount,
                count: shopCartsInfo.counts,
                discount: utilCommon.isNumberOfNaN(memberCardDto.memberTypeDiscount) ? Number(memberCardDto.memberTypeDiscount) / 10 : 0,//优惠折扣
            });
        });
    },
    /**
     * 设置店铺信息
     * @param cb
     */
    setResDetail(cb) {
        let _this = this,
            info = this.data.shopCartsInfo.info,
            orderType = this.data.orderType,
            totalPrice = this.data.totalPrice,
            fullFreeAmount = Number(info.fullFreeAmount) || 0,
            otherFees = {}, payType = 0;
        if (orderType == 1) {
            otherFees = {
                name: '配送费',//配送费名字
                price: 0,//配送费价格
                totalPrice: 0,//配送费价格
            };
            if (info.distributionCostType) {
                otherFees.totalPrice = util.money(Number(info.distributionFee) || 0);
            }
            if (fullFreeAmount && fullFreeAmount >= totalPrice) {
                otherFees.totalPrice = 0;
            }
        } else {
            let dinnerType = info.dinnerType || 0,
                serviceChange = Number(info.serviceChange) || 0;
            otherFees = {
                counts: 1,
                name: info.serviceChangeName,//茶位费名字
                price: serviceChange,//茶位费价格
                totalPrice: util.money(serviceChange)
            };
            if (info.payType) {
                dinnerType = 0;
            }
            if (dinnerType == 1) {//判断是堂食 1：取餐号 0：桌位号
                otherFees.price = 0;
            } else {
                payType = info.payType;//0:餐前付款  1:餐后付款
                _this.getTableDtoList();
            }
        }
        _this.setData({
            otherFees,
            payType
        });
        cb && cb();
    },
    setLoadDefaultAddress() {
        let _this = this;
        apiService.loadDefaultAddress({openId: app.globalData.openId}, function (rsp) {
            if (rsp.returnStatus) {
                //有默认地址
                _this.setData({
                    loadDefault: rsp.value
                });
            } else {
                //没有默认地址
                _this.setData({
                    DefaultAddress: true,
                });
            }
        });
    },
    toString(str) {
        return str.toString(2);
    },
    numberAdd: function (res) {
        if (this.data.hasConsumerId) {
            return;
        }
        var diningNumber = res.currentTarget.dataset.number;
        diningNumber++;
        this.setData({
            diningNumber: diningNumber
        });
    },
    numberReduce: function (res) {
        if (this.data.hasConsumerId) {
            return;
        }
        var that = this;
        var diningNumber = res.currentTarget.dataset.number;
        if (diningNumber >= 2) {
            diningNumber--;
        }
        if (diningNumber < 0) {
            diningNumber = 1;
        }
        that.setData({
            diningNumber: diningNumber
        });
    },
    tagChoose: function (e) {//做法选择
        var that = this
        var type = e.target.dataset.practies;
    },
    bindChange: function (e) {
        var that = this;
        that.setData({note: e.detail.value})
        //inputContent[e.currentTarget.id] = e.detail.value;
    },
    /**
     * 确认订单
     * @param res
     */
    submitOrder: function (res) {
        var that = this, orderType = that.data.orderType,
            consumerData = that.data.consumerData,
            consumerDataList = [],
            info = this.data.shopCartsInfo.info,
            data = {
                resId: that.data.resId,
                openId: that.data.openId,
            };
        for (let i = 0; i < consumerData.length; i++) {
            consumerDataList[i] = {};
            consumerDataList[i].foodCount = consumerData[i].info.counts;
            consumerDataList[i].foodCode = consumerData[i].foodCode;
            consumerDataList[i].isdiscount = consumerData[i].isdiscount;
            consumerDataList[i].ruleCode = consumerData[i].ruleCode;
            consumerDataList[i].practies = consumerData[i].practies;
        }
        data.orderFoodVosJson = JSON.stringify(consumerDataList);
        data.note = that.data.note;
        if (!orderType && that.data.hasTableCode && !that.data.tableDetail.tableCode) {
            wx.showToast({
                title: '请选择桌台',
                icon: 'success',
                duration: 2000
            });
            return;
        }


        if (orderType) {
            data.type = 2;
            data.addressId = that.data.loadDefault.id;
            data.distributionFee = this.data.otherFees.totalPrice;
            data.packingCharge = info.packingCharge;
        } else {
            data.type = 0;
            data.fNumber = that.data.diningNumber || 1;
            data.consumerId = that.data.consumerId;//消费者ID（可选，存在即为加菜）
            data.tableCode = that.data.tableDetail ? (that.data.tableDetail.tableCode || '') : '';
        }

        apiService.commitOrder(data, function (rsp) {
            let consumerId = rsp.value.id;
            that.clearShopCart();

            function redirctToUrl(text) {
                let url = "/pages/order/" + text + "/" + text + "?" +
                    "consumerId=" + consumerId +
                    "&resId=" + that.data.resId;
                if (!orderType) {
                    url = url + "&tableCode=" + that.data.tableCode
                }
                return url;
            }

            if (!orderType && that.data.payType == 1) {//餐后支付
                wx.redirectTo({
                    url: redirctToUrl('order-detail'),
                    success: function (res) {

                    }
                })
            } else {//餐前支付
                wx.redirectTo({
                    url: redirctToUrl('order-pay'),
                    success: function (res) {
                    }
                })
            }
        })
    },
    clearShopCart() {
        let resId = this.data.resId,
            orderList = this.data.orderList,
            orderType = this.data.orderType;
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].list = [];
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].totalPrice = 0;
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].counts = 0;
        app.globalData.shopCarts[resId][orderList[orderType] + 'Carts'].amount = 0;
        app.setShopCartsStorage();
    },
    tableBox: function () {
        if (this.data.hasTable) {
            return;
        }
        let _this = this,
            resId = this.data.resId,
            tableCode = this.data.tableDetail.tableCode,
            tableDtoList = this.data.tableDtoList,
            obj = {
                isLoading: false,
                title: '选择桌台',
                data: {},
                footer: [],
                tableContent: 'table-content',
            };
        _this.setData({
            ShopOneData: obj
        });

        for (let i = 0; i < tableDtoList.length; i++) {
            tableDtoList[i].checked = false;
        }

        function setData(data) {
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].tableList.length; j++) {
                    let list = data[i].tableList;
                    if (list[j].tableCode === tableCode) {
                        data[i].checked = true;
                        return {
                            data,
                            index: i
                        };
                    }
                }
            }
        }

        if (tableCode && tableCode.length > 0) {
            let value = setData(tableDtoList);
            obj.data.list = value.data;
            obj.data.tableList = value.data[value.index].tableList;
            obj.data.index = value.index;
        } else {
            obj.data.list = tableDtoList;
            obj.data.list[0].checked = true;
            obj.data.tableList = tableDtoList[0].tableList;
            obj.data.index = 0;
        }
        obj.isLoading = true;
        _this.setData({
            ShopOneData: obj
        });
        _this.openModule('moduleActiveMe');
    },
    /**
     * 获取座位信息
     */
    getTableDtoList() {
        let _this = this, resId = this.data.resId;
        apiService.findTableDtoList({resId: resId}, function (rsp) {
            if (rsp.returnStatus) {
                let tableDtoList = rsp.value;

                _this.setData({
                    tableDtoList
                })
            }
        });
    },
    modulePopup(e) {
        let active = e.target.dataset.active,
            _this = this;
        if (!active)
            return;
        if (active === 'close') {
            // 关闭弹窗
            _this.closeModule('moduleActiveMe');//规格弹框
        } else if (active === 'buttonItem subarea') {
            _this.subarea(e);
        } else if (active === 'buttonItem subareaItem') {
            _this.subareaItem(e);
        }
    },
    subarea: function (e) {
        var that = this,
            tableDtoList = this.data.tableDtoList,
            ShopOneData = this.data.ShopOneData,
            index = e.target.dataset.index,
            value = e.target.dataset.value;
        for (let i = 0; i < tableDtoList.length; i++) {
            tableDtoList[i].checked = false;
        }
        ShopOneData.data.list = tableDtoList;
        ShopOneData.data.list[index].checked = true;
        ShopOneData.data.tableList = tableDtoList[index].tableList;
        ShopOneData.data.index = index;
        this.setData({
            ShopOneData
        })
    },
    subareaItem: function (e) {
        let tableDetail = this.data.tableDetail,
            ShopOneData = this.data.ShopOneData,
            index = e.target.dataset.index,
            tableDtoList = this.data.tableDtoList;
        tableDetail = e.target.dataset.value;
        this.setData({
            ShopOneData, tableDetail
        });
        this.closeModule('moduleActiveMe');//规格弹框
    },
    queren: function () {
        var that = this;
        if (that.data.tableDetail.name == "请选择桌台") {
            that.data.tableDetail.name = that.data.subareaItem[0].name;
            that.data.tableDetail.code = that.data.subareaItem[0].tableCode;
            that.setData({selectTable: that.data.tableDetail.code});
            that.setData({tableDetail: that.data.tableDetail});
        }
        that.setData({tableCode: that.data.selectTable});
        that.setData({tableNo: 'tableBox'});
    },
};

Page(Object.assign(page, utilPage));
