const app = getApp(),
    config = require('../../../utils/config'),
    util = require('../../../utils/util.js'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        text: '确认订单',
        isShow: false,//进入初始是否刷新数据
        isShareCurrentPage: 1,//是否分享首页
        orderType: 0,//0：堂食  1：外卖
        orderString: {
            foodList: {isEatin: 1},
            str: 'hallCarts'
        },//0：堂食  1：外卖
        isOrderType: 0,//0：堂食 1：自助取餐 2：外卖 3餐后付款
        isSubmitOrder: true,//是否提交订单
        isShopList: true,//默认是否打开菜品列表
        imageServer: config.imageUrl,//图片服务器地址
        orderList: ['hall', 'order'],//hall：堂食  order：外卖,
        shopInfo: {},//店铺信息
        userInfo: {},//用户信息
        shopCarts: [],//购物车信息
        consumerData: [],//订单菜品数据
        memberCardDto: {},//会员卡信息
        isMemberCardDto: null,//是否是会员
        isCommitOrder: false,//是否创建订单
        consumerId: null,
        hasConsumerId: false,//是否有订单
        hasTableCode: false,//是否带桌台
        options: {},
        amount: 0,//总菜数
        counts: 0,//菜品数
        note: "",//备注信息
        otherList: [],//其他费用（点餐页显示）
        totalPrice: 0,//总金额
        discountTotalPrice: 0,//折后总价
        offerTotalPrice: 0,//已优惠金额
        discountPrice: 0,//折扣后价钱
        tableDtoList: {},//获取的桌台List信息
        otherFees: {//其他费用（非点餐页显示）
            name: '',
            counts: 0,
            price: 0,
            totalPrice: 0
        },
        diningNumber: 1,//就餐人数
        userOrderInfo: {//桌台信息
            tableCode: '',
            name: '请选择桌台',
            consumerId: null,
            fNumber: 1,
            status: 0
        },
        paymentMethod: '',//支付方式
        //外卖
        loadDefault: null,
        DefaultAddress: false,
    },
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        new app.PickerView();//初始自定义弹窗
        let that = this;
        try {
            if (options) {
                Object.assign(that.data.options, options);
                console.warn(`初始化${that.data.text}`, options);
            } else {
                throw {message: '初始化options为空'};
            }
        } catch (e) {
            console.warn(e, options);
        }
        that.loadCb();
    },
    /**
     * 页面渲染完成
     */
    onReady: function () {
        this.setData({
            isShow: true
        });
    },
    /**
     * 页面显示
     * @param options 为页面跳转所带来的参数
     */
    onShow(options) {
        if (this.data.isShow) {
            this.loadData();
        }
        if (this.data.isShow && this.data.isCommitOrder) {
            try {
                this.goOrderDetail({resId: this.data.resId, consumerId: this.data.consumerInfo.consumerId})
            } catch (e) {
                util.go(-2)
            }
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
    }
};
// 方法类
const methods = {
    loadCb() {
        let that = this,
            options = that.data.options,
            resId = options.resId,
            orderType = Number(options.orderType) || 0,
            orderArr = [
                {
                    foodList: {isEatin: 1},
                    str: 'hallCarts'
                },
                {
                    foodList: {isTakeaway: 1},
                    str: 'takeawayCarts'
                }
            ];
        if (1 === orderType) {
            that.data.orderString = orderArr[1];
        } else {
            that.data.orderString = orderArr[0];
        }
        if (1 === orderType) {
            that.utilPage_setNavigationBarTitle(`外卖-确认订单`);
        } else if (2 === orderType) {
            that.utilPage_setNavigationBarTitle(`自助取餐-确认订单`);
        } else if (3 === orderType) {
            that.utilPage_setNavigationBarTitle(`餐后付款-确认订单`);
        } else {
            that.utilPage_setNavigationBarTitle(`堂食-确认订单`);
        }
        // app.globalData.shopCarts[resId][that.data.orderString.str]
        let shopCarts = app.globalData.shopCarts[resId][that.data.orderString.str],
            otherList = shopCarts.otherList,
            totalPrice = shopCarts.totalPrice,
            amount = shopCarts.amount,
            counts = shopCarts.counts;
        that.setData({
            resId,
            orderType,
            shopCarts,
            otherList,
            totalPrice,
            amount,
            counts
        });
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    ApiService.token = rsp.value.token;
                    that.loadData();
                } else {
                    console.warn('获取objId失败');
                    util.failToast('用户登录失败');
                }
            },
            (err) => {

            }
        );

    },
    loadData(cb) {
        let that = this,
            shopCarts = that.data.shopCarts,
            userOrderInfo = app.globalData.userOrderInfo || {},
            userInfo = app.globalData.userInfo || {},
            resId = that.data.resId,
            objId = that.data.objId,
            orderType = that.data.orderType,
            data = {};
        if (1 === orderType) {
            that.setLoadDefaultAddress();
        } else if (0 === orderType || 3 === orderType) {
            if (userOrderInfo.tableCode && userOrderInfo.tableCode.length > 0) {
                Object.assign(that.data.userOrderInfo, userOrderInfo);
                let diningNumber = userOrderInfo.fNumber || 1;
                userOrderInfo.name && userOrderInfo.name.length && (userOrderInfo.name = decodeURIComponent(userOrderInfo.name));
                data = {
                    userOrderInfo,
                    diningNumber,
                    hasTableCode: true,
                    hasConsumerId: userOrderInfo.consumerId ? true : false
                }
            }
        }
        data.userInfo = userInfo;
        let memberCardDtoData = {};
        // 获取会员卡信息
        ApiService.checkMember(
            {
                resId, objId, config: {
                    isLoading: true
                }
            },
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    memberCardDtoData.memberCardDto = rsp.value.member;
                    if (utilCommon.isEmptyValue(memberCardDtoData.memberCardDto)) {
                        memberCardDtoData.isMemberCardDto = true
                    }
                    app.globalData.memberCardDtos[resId] = that.data.memberCardDto;
                }
            },
            (err) => {
                if (utilCommon.isEmptyValue(that.data.memberCardDto)) {
                    data.isMemberCardDto = true
                } else {
                    data.isMemberCardDto = false
                }
                /**
                 * 设置购物车数据
                 */
                that.setResDetail(function () {
                    that.setData(Object.assign(data, memberCardDtoData, {
                        consumerData: shopCarts.list
                    }));
                    that.updateConsumerData();
                });
                cb && cb()
            }
        );
    },
    /**
     * 更新价钱并保存本地购物车
     * @param bol
     */
    updateConsumerData(data = {}) {
        let that = this,
            consumerData = that.data.consumerData,
            len = consumerData.length,
            otherList = that.data.otherList,
            diningNumber = that.data.diningNumber,
            memberCardDto = that.data.memberCardDto,
            totalPrice = 0,
            otherTotalPrice = 0,
            offerTotalPrice = 0,
            discountTotalPrice = 0,
            otherListPrice = 0;
        for (let i = 0; i < len; i++) {
            let item = consumerData[i],
                info = consumerData[i].info,
                discountPrice = 0,
                offerPrice = 0,
                count = info.count,
                price = info.price || 0;
            totalPrice += price * count;//原价计算
            if (item && utilCommon.isEmptyObject(item.rule)) {//规格
                item.isdiscount = item.rule.status;
            }
            if (memberCardDto && 0 === memberCardDto.status && memberCardDto.typeId) {
                if (item && utilCommon.isEmptyObject(item.rule)) {//规格
                    discountPrice = item.rule.minMemberPrice || 0;
                    discountPrice = discountPrice * count;
                    offerPrice = price * count - discountPrice;
                    info.discountPrice = discountPrice;
                    info.offerPrice = offerPrice >= 0 ? util.money(offerPrice) : 0;
                } else {//无规格
                    discountPrice = item.memberPrice || item.price;
                    discountPrice = discountPrice * count;
                    offerPrice = price * count - discountPrice;
                    info.discountPrice = discountPrice;
                    info.offerPrice = offerPrice >= 0 ? util.money(offerPrice) : 0;
                }
            } else {
                info.discountPrice = price * info.count;
                info.offerPrice = 0;
            }

            discountTotalPrice += info.discountPrice;
            offerTotalPrice += info.offerPrice;
            data[`consumerData[${i}].info.discountPrice`] = info.discountPrice;
            data[`consumerData[${i}].info.offerPrice`] = info.offerPrice;
            data[`consumerData[${i}].isdiscount`] = item.isdiscount;
        }
        that.data.otherFees.counts = diningNumber;
        // 其他费用（非点餐页显示）
        if (1 === that.data.orderType) {
            diningNumber = 0;
        } else {
            that.data.otherFees.totalPrice = that.data.otherFees.price * that.data.otherFees.counts || 0;
        }
        // 其他费用（点餐页显示）
        if (otherList && otherList.length > 0) {
            let len = otherList.length;
            for (let i = 0; i < len; i++) {
                otherListPrice += otherList[i].price || 0;
            }
        }
        otherTotalPrice = that.data.otherFees.totalPrice + otherListPrice || 0;
        this.setData(Object.assign(data, {
            ['otherFees.counts']: diningNumber,
            diningNumber,
            totalPrice,
            otherTotalPrice,
            offerTotalPrice,
            discountTotalPrice,
        }));
    },
    /**
     * 设置店铺信息
     * @param cb
     */
    setResDetail(cb) {
        let that = this,
            info = that.data.shopCarts.info,
            orderType = that.data.orderType,
            totalPrice = that.data.totalPrice || 0,
            fullFreeAmount = Number(info.fullFreeAmount) || 0,
            otherFees = {};
        if (1 === orderType) {
            that.data.diningNumber = 0;
            otherFees = {
                name: '免配送费',//配送费名字
                price: 0,//配送费价格
                totalPrice: 0,//配送费价格
            };
            if (Number(info.distributionCostType) === 1) {
                otherFees.name = '配送费';//配送费名字
                otherFees.totalPrice = util.money(Number(info.distributionFee) || 0);
                otherFees.price = util.money(Number(info.distributionFee) || 0);
            }
            let otherListPrice = Number(that.data.otherList[0].price) || 0;
            if (fullFreeAmount && fullFreeAmount <= totalPrice - otherListPrice) {
                otherFees.name = '单笔满￥' + fullFreeAmount + '免配送费';//配送费名字
                otherFees.totalPrice = 0;
                otherFees.price = 0;
            }
        } else if (2 === orderType) {
            // 自助取餐
            otherFees = {};
        } else if (0 === orderType || 3 === orderType) {
            let serviceChange = Number(info.serviceChange) || 0;
            otherFees = {
                counts: 1,
                name: info.serviceChangeName,//茶位费名字
                price: serviceChange,//茶位费价格
                totalPrice: util.money(serviceChange)
            };
            if (this.data.hasConsumerId) {
                otherFees = {
                    counts: 1,
                    name: '加菜免茶位费',//茶位费名字
                    price: 0,//茶位费单价
                    totalPrice: 0//茶位费总价
                };
            }
            that.getTableDtoList();//获取座位信息
        }
        that.setData({otherFees, shopInfo: info});
        cb && cb();
    },
    toString(str) {
        return str.toString(2);
    },
    bindChange: function (e) {
        var that = this;
        that.setData({note: e.detail.value})
    },
    clearShopCart() {
        let resId = this.data.resId,
            orderString = this.data.orderString.str;
        app.globalData.shopCarts[resId][orderString].list = [];
        app.globalData.shopCarts[resId][orderString].totalPrice = 0;
        app.globalData.shopCarts[resId][orderString].counts = 0;
        app.globalData.shopCarts[resId][orderString].amount = 0;
        app.setShopCartsStorage();
    },
    tableBox: function () {
        if (this.data.hasTableCode) {
            return;
        }
        let _this = this,
            resId = this.data.resId,
            tableCode = this.data.userOrderInfo.tableCode,
            tableDtoList = this.data.tableDtoList,
            obj = {
                isLoading: false,
                isAnimated: true,
                title: '选择桌台',
                data: {},
                tableContent: 'table-content',
            };
        _this.setData({
            moduleActiveMeData: obj
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
            moduleActiveMeData: obj
        });
        _this.utilPage_openModule('moduleActiveMe');
    },
    subarea: function (e) {
        var that = this,
            tableDtoList = this.data.tableDtoList,
            moduleActiveMeData = this.data.moduleActiveMeData,
            index = e.currentTarget.dataset.index,
            value = e.currentTarget.dataset.value;
        for (let i = 0; i < tableDtoList.length; i++) {
            tableDtoList[i].checked = false;
        }
        moduleActiveMeData.data.list = tableDtoList;
        moduleActiveMeData.data.list[index].checked = true;
        moduleActiveMeData.data.tableList = tableDtoList[index].tableList;
        moduleActiveMeData.data.index = index;
        this.setData({
            moduleActiveMeData
        })
    },
    subareaItem: function (e) {
        let userOrderInfo = this.data.userOrderInfo,
            moduleActiveMeData = this.data.moduleActiveMeData,
            index = e.currentTarget.dataset.index,
            tableDtoList = this.data.tableDtoList;
        let value = e.currentTarget.dataset.value;
        userOrderInfo.tableCode = value.tableCode;
        userOrderInfo.name = value.name;
        this.setData({
            moduleActiveMeData, userOrderInfo
        });
        this.utilPage_closeModule('moduleActiveMe');//规格弹框
    },
    /**
     * 设置人数
     * @param res
     */
    numberAdd: function (e) {
        let _this = this,
            number = Number(e.currentTarget.dataset.number) || 0;
        if (this.data.hasConsumerId) {
            return;
        }
        _this.data.diningNumber += number;
        if (_this.data.diningNumber <= 0) {
            _this.data.diningNumber = 1;
        } else if (_this.data.diningNumber > 100) {
            _this.data.diningNumber = 100;
        }
        _this.updateConsumerData();
    },
    /**
     * 获取座位信息
     */
    getTableDtoList() {
        let that = this, resId = that.data.resId;
        ApiService.findTableDtoList(
            {resId},
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let tableDtoList = rsp.value;
                    that.setData({
                        tableDtoList
                    })
                }
            }
        );
    },
    /**
     * 确认订单
     * @param res
     */
    submitOrder(e) {
        if (!this.data.isSubmitOrder) {
            return;
        }
        let that = this,
            orderType = that.data.orderType,
            formId = e.detail.formId,
            value = e.detail.value,
            consumerData = that.data.consumerData,
            consumerDataList = [],
            info = that.data.shopCarts.info,
            objId = that.data.objId,
            resId = that.data.resId,
            data = {resId, objId};
        for (let i = 0; i < consumerData.length; i++) {
            consumerDataList[i] = {};
            consumerDataList[i].foodCount = consumerData[i].info.count;
            consumerDataList[i].foodCode = consumerData[i].foodCode;
            consumerDataList[i].isdiscount = consumerData[i].isdiscount;
            consumerDataList[i].ruleCode = consumerData[i].ruleCode;
            consumerDataList[i].foodType = consumerData[i].foodType;
            consumerDataList[i].practies = [];
            if (consumerData[i].practices && consumerData[i].practices.length > 0) {
                for (let j = 0; j < consumerData[i].practices.length; j++) {
                    if (consumerData[i].practices[j] && consumerData[i].practices[j].length > 0) {
                        consumerDataList[i].practies.push(consumerData[i].practices[j]);
                    }
                }
            }
            consumerDataList[i].foodPackages = [];
            if (consumerData[i].foodPackages && consumerData[i].foodPackages.length > 0) {
                consumerDataList[i].foodPackages = consumerData[i].foodPackages;
            }
        }
        data.orderFoodVosJson = JSON.stringify(consumerDataList);
        data.note = that.data.note;
        if (0 === orderType || 3 === orderType) {
            if (0 === orderType && !that.data.userOrderInfo.tableCode) {
                wx.showToast({
                    title: '请选择桌台',
                    icon: 'success',
                    duration: 2000
                });
                return;
            }
            data.type = 0;
            data.fNumber = that.data.diningNumber || 1;
            data.consumerId = that.data.userOrderInfo.consumerId;//消费者ID（可选，存在即为加菜）
            data.tableCode = that.data.userOrderInfo ? (that.data.userOrderInfo.tableCode || '') : '';
            if (3 === orderType) {
                ApiService.checkHasWaitPayConsumer({
                    objId,
                    tableCode: data.tableCode,
                    resId,
                    config: {
                        isLoading: true
                    }
                }, (rsp) => {
                    if (data.consumerId && rsp.code === '2001' && utilCommon.isEmptyValue(rsp.value)) {
                        wx.showModal({
                            content: '您的订单数据异常，请重新扫码点餐',
                            showCancel: false,
                            confirmText: '知道了',
                            success: function (rsp) {
                                util.go(-2);
                            }
                        });
                    } else if (rsp.code === '2000' || rsp.code === '2001') {
                        rsp.code === '2001' && (data.consumerId = '');
                        rsp.code === '2000' && (data.consumerId = rsp.value.consumerId || '');
                        that.commitOrder(data, null, formId);
                    } else {
                        util.failToast({
                            title: rsp.message,
                            success() {
                                util.go(-2);
                            }
                        });
                    }
                });
            } else {
                commitOrder();
            }
        } else if (1 === orderType) {
            if (that.data.DefaultAddress) {
                data.type = 2;
                data.addressId = that.data.loadDefault.id;//配送地址Id
                data.distributionFee = this.data.otherFees.totalPrice;//配送费
                data.packingCharge = info.packingCharge;//打包费
            } else {
                that.openAddressModule();
                return;
            }
            commitOrder();
        } else if (2 === orderType) {
            data.type = 0;
            data.consumerId = that.data.userOrderInfo.consumerId;//消费者ID（可选，存在即为加菜）l
            commitOrder();
        }

        function commitOrder() {
            let flag = false;
            // 提交数据
            that.data.isSubmitOrder = false;
            data.config = {
                isLoading: true
            };
            let paymentMethod = value.paymentMethod;
            if ('weChat' === paymentMethod) {
                that.commitOrder(data, 'weChat', formId);
            } else if ('member' === paymentMethod) {
                that.commitOrder(data, 'member', formId);
            } else if (that.data.hasConsumerId) {
                that.commitOrder(data, null, formId);
            } else {
                that.showToast('请选择支付方式');
                that.data.isSubmitOrder = true
            }

            // that.azm_pickerView_show({
            //     title: '支付方式',
            //     type: 'pickerViewPayment',
            //     cancelText: '取消支付',
            //     isAnimated: true,
            //     data: {
            //         actualPrice: that.data.discountTotalPrice + that.data.otherTotalPrice,
            //         memberCardDto: that.data.memberCardDto,
            //         isMemberCardDto: utilCommon.isEmptyObject(that.data.memberCardDto)
            //     },
            //     success(res) {
            //         console.log(res);
            //         if (res.confirm) {
            //             if ('payment' === res.select || 'weChat' === res.select) {//去支付&微信支付
            //                 flag = true;
            //                 that.commitOrder(data, res.select, formId);
            //             } else if ('recharge' === res.select) {//充值
            //                 wx.showModal({
            //                     content: '您的会员卡余额不足，请联系商家充值',
            //                     showCancel: false,
            //                     confirmText: '知道了',
            //                     success: function (rsp) {
            //
            //                     }
            //                 });
            //             } else if ('apply' === res.select) {//申请
            //                 wx.showModal({
            //                     content: '您的会员卡余额不足，请联系商家充值',
            //                     showCancel: false,
            //                     confirmText: '知道了',
            //                     success: function (rsp) {
            //
            //                     }
            //                 });
            //             }
            //         }
            //     },
            //     fail(rsp) {
            //         console.log(rsp);
            //
            //     },
            //     complete(rsp) {
            //         if (rsp.cancel) {
            //
            //         }
            //         if (!flag) {
            //             that.data.isSubmitOrder = true;
            //         }
            //     }
            // });
        }
    },
    /**
     * 创建订单
     * @param data
     * @param type
     * @param formId
     */
    commitOrder(data, type, formId) {
        let that = this,
            flag = false,
            objId = that.data.objId,
            orderType = that.data.orderType,
            resId = that.data.resId;
        that.data.isSubmitOrder = false;
        data.config = {
            isLoading: true
        }
        ApiService.commitOrder(data,
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    flag = true;
                    let consumerId = rsp.value.consumerId,
                        data = {consumerId, resId};
                    that.clearShopCart();//清除购物车
                    that.data.isCommitOrder = true;
                    that.data.consumerInfo = rsp.value;
                    if (formId && 'the formId is a mock one' !== formId && 3 === orderType) {
                        /**
                         * 模板消息推送
                         */
                        ApiService.sendMiniWxTemplateMsg({
                            resId,
                            consumerId,
                            objId,
                            formId
                        });
                    }
                    if (1 !== orderType) {
                        data.tableCode = that.data.tableCode;
                    }
                    if ('weChat' === type) { // 微信支付
                        that.weChatPay(rsp.value)
                    } else if ('member' === type) { // 会员卡支付
                        that.memberPay(rsp.value);
                    } else {
                        that.goOrderDetail({consumerId, resId});
                    }
                }
            },
            () => {
                if (!flag) {
                    that.data.isSubmitOrder = true;
                }
            }
        )
    },
    /**
     * 会员卡支付
     * @param params
     */
    memberPay(params) {
        let that = this;
        util.go('/pages/order/member-pay/member-pay', {
            data: {
                amount: params.actualPrice,
                consumerId: params.consumerId,
                resId: that.data.resId,
                isGoOrderPage: 1
            }
        })
    },
    /**
     * 微信支付
     * @param params
     */
    weChatPay(params) {
        let that = this,
            objId = that.data.objId,
            orderNo = params.consumerId,
            orderMoney = parseInt(params.actualPrice * 100),
            subject = '微信点餐',// 商品名称
            body = '微信点餐',
            flag = false,
            consumerId = orderNo,
            resId = that.data.resId;
        ApiService.wxPayForH5(
            {
                orderNo, orderMoney, subject, body, objId, resId, config: {isLoading: true}
            },
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    let value = rsp.value, wxPay = value.woi;
                    flag = true;
                    wx.requestPayment({
                        'timeStamp': wxPay.timestamp,
                        'nonceStr': wxPay.noncestr,
                        'package': 'prepay_id=' + wxPay.prepayid,//之前的
                        'signType': 'MD5',
                        'paySign': value.paySign,
                        'appid': wxPay.appid,
                        'total_fee': orderMoney,
                        objId,
                        success(res) {
                            that.finishPay();
                            util.showToast({
                                title: '微信支付成功',
                                success() {
                                    that.goOrderDetail({consumerId, resId});
                                }
                            });
                        },
                        fail(res) {
                            util.failToast({
                                title: '微信支付失败',
                                success() {
                                    that.goOrderDetail({consumerId, resId});
                                }
                            });
                        },
                        complete(res) {
                            if ('requestPayment:cancel' === res.errMsg) {
                                util.failToast({
                                    title: '微信支付已取消',
                                    success() {
                                        that.goOrderDetail({consumerId, resId});
                                    }
                                });
                            }
                        }
                    });
                }
            },
            () => {
                if (!flag) {
                    util.failToast({
                        title: '微信支付失败',
                        success() {
                            that.goOrderDetail({consumerId, resId});
                        }
                    });
                }
            });
    },
    /**
     * 完成微信支付
     */
    finishPay() {
        let that = this,
            objId = that.data.objId,
            data = {
                consumerId: that.data.consumerId,
                resId: that.data.resId,
                type: 0,
                objId,
            };
        ApiService.finishPay(data);
    },
    goOrderDetail(data) {
        util.go('/pages/order/order-detail/order-detail', {
            type: 'goOrder',
            data
        })
    },
    /**
     * 设置外卖默认地址
     */
    setLoadDefaultAddress() {
        let that = this, flag = false;
        ApiService.loadDefaultAddress(
            {userId: that.data.objId},
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    //有默认地址
                    that.setData({
                        loadDefault: rsp.value,
                        DefaultAddress: true,
                    });
                    flag = true;
                }
            },
            () => {
                if (!flag) {
                    //没有默认地址
                    that.openAddressModule();
                    that.setData({
                        DefaultAddress: false,
                    });
                }
            });
    },
    /**
     * 弹框提示是否有默认地址
     */
    openAddressModule() {
        let that = this;
        wx.showModal({
            title: '温馨提示',
            content: '请设置配送地址',
            showCancel: false,
            confirmText: '添加地址',
            success: function (res) {
                if (res.confirm) {
                    that.goAddress()
                } else if (res.cancel) {

                }
            }
        });
    },
    /**
     * 新添加收货地址
     */
    goAddress() {
        util.go('/pages/vkahui/address/address', {
            data: {
                isWaimai: 1
            }
        })
    }
};
// 事件类
const events = {
    bindAzmAddFood(e) {
        let _this = this;
        _this.plusFood(1, e);
    },
    bindAzmLessFood(e) {
        let _this = this;
        _this.plusFood(-1, e);
    },
    bindAzmClearShopCart() {
        let _this = this;
        _this.clearShopCart();
    },
    bindAzmPopupSubareaItemBtn(e) {
        let _this = this;
        _this.subareaItem(e);
    },
    bindAzmPopupSubareaBtn(e) {
        let _this = this;
        _this.subarea(e);
    },
    bindAzmCloseMask(e) {
        // 关闭弹窗
        let _this = this, type = e.currentTarget.dataset.type;
        console.log(e);
        if ("pickerViewPayment" === type) {

        } else {
            _this.utilPage_closeModule('moduleActiveMe');//规格弹框
        }
    },
    bindOpenShopList() {
        this.setData({
            isShopList: !this.data.isShopList
        })
    },
    bindRadioGroup() {
        let that = this;
        this.loadData(
            () => {
                let memberCardDto = that.data.memberCardDto,
                    totalPrice = that.data.otherTotalPrice + that.data.discountTotalPrice,
                    isMemberCardDto = that.data.isMemberCardDto;
                if (isMemberCardDto) {
                    if (memberCardDto.availableBalance < totalPrice) {
                        that.setData({
                            paymentMethod: 'weChat'
                        })
                    }
                } else {
                    that.setData({
                        paymentMethod: 'weChat'
                    })
                }
            }
        )
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));
