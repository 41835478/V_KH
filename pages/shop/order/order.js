const app = getApp(),
    config = require('../../../utils/config'),
    util = require('../../../utils/util'),
    utilCommon = require('../../../utils/utilCommon'),
    ApiService = require('../../../utils/ApiService');
const appPage = {
    data: {
        text: "Page Takeaway",
        isShow: false,//进入初始是否刷新数据
        hasMoreData: false,//是否有更多
        isAnimated: false,
        options: {},
        orderType: 0,
        orderString: {
            foodList: {isEatin: 1},
            str: 'hallCarts'
        },
        isShareCurrentPage: 1,//是否分享首页
        imageServer: config.imageUrl,//图片服务器地址
        shopInfo: {},//餐厅信息
        memberCardDto: {},//会员卡信息
        findFoodCatalogList: [],//菜品tab列表
        _findFoodCatalogList: {},//菜品tab列表
        foodList: [],//菜品列表
        foodListObj: {},//菜品列表
        _foodListObj: {},
        shopCart: [],//购物车菜品列表
        dishesTab: {
            index: 0,
            code: ''
        },//tabID
        isBindDishesTab: true,//是否点击了tab
        isPlusToShopCart: true,//是否点击了添加菜品按钮
        totalPrice: 0,//总价
        counts: 0,//总数
        amount: 0,//菜品数量
        moduleRuleData: {},//规格弹框临时信息
        moduleRule: '',//规格弹框临时信息class
        modulePackageData: {},//套餐弹框临时信息
        modulePackage: '',//套餐弹框临时信息class
        otherList: [],//购物车其他费用列表
        otherPrice: {},//其他费用
        shopCartModule: 0,//购物车模态框class
        deliveryAmount: 0,//起送金额
        isDeliveryAmount: false,//是否达到配送金额
        isConsumerId: 0,//是否有订单
        isAddFood: 0,//是否为加菜


        dishesTabListIndex: '',//tab列表ID
        discountTotalPrice: 0,//折后总价
        offerPrice: 0,//已优惠金额
        shopCartToFoodList: {},//购物车菜品渲染列表

        isPlusFood: true,
        foodListScrollTop: 0,//当前菜品列表滚动位置
        isScrollFoodList: false,//是否菜品列表滚动
        foodListTab: [],//菜品tab数量图标

    },
    /**
     * 页面初始化
     * @param options 为页面跳转所带来的参数
     */
    onLoad: function (options) {
        new app.ToastPannel();//初始自定义toast
        new app.ModulePopup();//初始自定义弹窗
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
    onShow: function (options) {
        console.warn(`${this.data.text}页面显示`);
        let that = this;
        this.bindAzmCloseMask();//初始化所以弹框
        if (this.data.isShow && app.globalData.isShow) {
            that.loadData();
        }
    },
    onHide: function () {
        // 页面隐藏
    },
    onUnload: function () {
        // 页面关闭
        this.setData({
            shopCart: []
        });
    }
};
/**
 * 方法类
 */
const methods = {
    loadCb() {
        let that = this;
        app.getLoginRequestPromise().then(
            (rsp) => {
                if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                    that.data.objId = rsp.value.objId;
                    that.data.token = rsp.value.token;
                    that.data.userInfo = app.globalData.userInfo;
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
    /**
     * 加载数据
     */
    loadData() {
        let that = this,
            options = that.data.options;
        if (!options.resId) util.go(-1);
        that.data.resId = options.resId;
        that.data.orderType = Number(options.orderType) || 0;
        let orderArr = [
            {
                foodList: {isEatin: 1},
                str: 'hallCarts'
            },
            {
                foodList: {isTakeaway: 1},
                str: 'takeawayCarts'
            }
        ];
        if (1 === that.data.orderType) {
            that.data.orderString = orderArr[1];
        } else {
            that.data.orderString = orderArr[0];
        }
        // 获取店铺信息
        that.utilPage_getResDetail(options.resId)
            .then(
                () => {
                    let shopInfo = that.data.shopInfo,
                        orderType = that.data.orderType;
                    that.data.text = shopInfo.resName;
                    if (1 === orderType) {
                        that.utilPage_setNavigationBarTitle(`外卖-${shopInfo.resName}`)
                    } else if (2 === orderType) {
                        that.utilPage_setNavigationBarTitle(`自助取餐-${shopInfo.resName}`)
                    } else if (3 === orderType) {
                        that.utilPage_setNavigationBarTitle(`餐后付款-${shopInfo.resName}`)
                    } else {
                        that.utilPage_setNavigationBarTitle(`堂食-${shopInfo.resName}`)
                    }
                    that.getUserOrderInfo();//设置与获取用户订单信息
                    that.findFoodCatalogList(that.data.orderString.foodList)
                        .then(
                            (rsp) => {
                                that.getShopCart();//获取购物车
                                that.setData({hasMoreData: true, orderType});
                            },
                            (err) => {
                                if (err)
                                    throw {
                                        code: 4000,
                                        message: '获取菜品列表失败'
                                    };
                            }
                        )
                },
                (err) => {
                    if (1 === err.code)
                        that.showToast('获取店铺信息失败,请重试');
                }
            );
    },
    /**
     * 获取菜品列表
     */
    getFoodList(data, resolve, reject) {
        // data = {isEatin: 1};//堂食菜品
        // data = {isTakeaway: 1};//外卖菜品
        let that = this;
        data.resId = that.data.resId;
        data.objId = that.data.objId;
        data.config = {
            isLoading: true
        };
        if (that.data.foodListObj[data.foodCatalog] && that.data.foodListObj[data.foodCatalog].length > 0) {
            resolve && resolve();
        } else {
            ApiService.getFoodList(data,
                (rsp) => {
                    if (2000 == rsp.code && rsp.value && rsp.value.length > 0) {
                        let foodList = rsp.value;
                        if (data.foodCatalog) {
                            that.setData({
                                [`foodListObj.${data.foodCatalog}`]: foodList
                            });
                        } else {
                            that.setData({foodList});
                        }
                    } else {
                    }
                },
                () => {
                    resolve && resolve();
                }
            );
        }
    },
    /**
     * 获取菜品tab分类
     */
    findFoodCatalogList(data) {
        let that = this,
            resId = that.data.resId,
            index = that.data.dishesTab.index;
        // data.filterZero = 1;//过滤空的菜品类别
        return new Promise((resolve, reject) => {
            // data.resId = that.data.resId;
            ApiService.findFoodCatalogList(Object.assign({resId, filterZero: 1}, data),
                (rsp) => {
                    if (2000 == rsp.code && rsp.value && rsp.value.length > 0) {
                        let findFoodCatalogList = rsp.value;
                        that.bindDishesTab(null, rsp.value[index].catalogCode, index);
                        that.setData({
                            findFoodCatalogList
                        });
                        resolve();
                    } else {
                        reject();
                    }
                }
            );
        })
    },
    /**
     * 获取本地购物车
     */
    getShopCart() {
        let that = this,
            resId = that.data.resId,
            orderString = that.data.orderString.str,
            _foodListObj = that.data._foodListObj,
            _findFoodCatalogList = that.data._findFoodCatalogList,
            shopCarts = {},
            data = {};
        if (!app.globalData.shopCarts[resId]) {
            that.utilPage_setShopCartsStorage();
        }
        shopCarts = app.globalData.shopCarts[resId][orderString];
        let deliveryAmount = Number(shopCarts.info.deliveryAmount) || 0,
            shopCart = Object.assign(shopCarts.list) || [],
            otherList = shopCarts.otherList,
            otherPrice = shopCarts.info;
        data = {otherPrice, otherList, deliveryAmount};
        if (shopCart && shopCart.length > 0) {
            // for (let i = 0; i < shopCart.length; i++) {
            //     _foodListObj[shopCart[i].foodCode] = shopCart[i].info;
            //     _findFoodCatalogList[shopCart[i].catalogCode].count += shopCart[i].info.count;
            // }
        } else {
            data.totalPrice = 0;
            data.counts = 0;
            data.amount = 0;
            data.shopCart = [];
            data._foodListObj = {};
            data._findFoodCatalogList = {};
        }
        // let shopCart = Object.assign(shopCarts.list) || [],
        //     totalPrice = shopCarts.totalPrice,
        //     counts = shopCarts.counts,
        //     amount = shopCarts.amount,
        //     data2 = {
        //         shopCart, totalPrice, counts, amount, _foodListObj, _findFoodCatalogList
        //     };
        that.setData(data);
    },
    /**
     * 设置本地购物车
     */
    setShopCart() {
        let that = this,
            orderString = that.data.orderString.str;
        app.globalData.shopCarts[this.data.resId][orderString].list = this.data.shopCart;
        app.globalData.shopCarts[this.data.resId][orderString].totalPrice = this.data.totalPrice;
        app.globalData.shopCarts[this.data.resId][orderString].discountTotalPrice = this.data.discountTotalPrice;
        app.globalData.shopCarts[this.data.resId][orderString].offerPrice = this.data.offerPrice;
        app.globalData.shopCarts[this.data.resId][orderString].counts = this.data.counts;
        app.globalData.shopCarts[this.data.resId][orderString].amount = this.data.amount;
        app.setShopCartsStorage();
    },
    /**
     * 获取购物车中菜品索引
     * @param code
     * @returns {number}
     */
    getShopCartIndex(value) {
        return this.data.shopCart.findIndex((n) => {
            if (value.foodCode === n.foodCode) {
                let flag = [0, 0, 0];
                if (value.ruleCode) {
                    flag[0] = value.ruleCode === n.ruleCode ? 1 : 0;
                } else {
                    flag[0] = 1;
                }
                if (value.practices) {
                    flag[1] = utilCommon.isEqualToString(value.practices, n.practices) ? 1 : 0;
                } else {
                    flag[1] = 1;
                }
                if (value.foodPackages) {
                    flag[2] = utilCommon.isEqualToString(value.foodPackages, n.foodPackages) ? 1 : 0;
                } else {
                    flag[2] = 1;
                }
                if (flag[0] + flag[1] + flag[2] === 3) {
                    return true;
                }
            }
        });
    },
    /**
     * tap点击事件
     * @param e
     */
    bindDishesTab(e, code = null, index = 0) {
        if (!this.data.isBindDishesTab) {
            return;
        }
        this.data.isBindDishesTab = false;
        let that = this,
            orderString = that.data.orderString;
        if (e) {
            index = e.currentTarget.dataset.index;
            code = e.currentTarget.dataset.code
        }
        if (!code) return;
        that.getFoodList(
            Object.assign(orderString.foodList, {foodCatalog: code, index}
            ),
            () => {
                that.data.isBindDishesTab = true;
                if (code !== that.data.dishesTab.code) {
                    that.setData({
                        dishesTab: {code, index}
                    })
                }
            }
        );
    },
    /**
     * 设置tab的数量
     * @param num
     * @returns {*}
     */
    setTabNumber(num, dishesTab) {
        dishesTab = dishesTab || this.data.dishesTab;
        let that = this,
            tabCount = 0,
            findFoodCatalogList = that.data.findFoodCatalogList,
            _findFoodCatalogList = that.data._findFoodCatalogList;
        if (_findFoodCatalogList[dishesTab.code] && dishesTab.code === _findFoodCatalogList[dishesTab.code].catalogCode) {
            tabCount = Number(_findFoodCatalogList[dishesTab.code].count) || 0;
        } else {
            if (!_findFoodCatalogList[dishesTab.code] || 'object' === typeof _findFoodCatalogList[dishesTab.code]) {
                _findFoodCatalogList[dishesTab.code] = {};
            }
            Object.assign(_findFoodCatalogList[dishesTab.code], findFoodCatalogList[dishesTab.index]);
        }
        tabCount += num;
        if (tabCount < 0) {
            tabCount = 0;
        }
        return tabCount;
    },
    /**
     * 单独更新总价与购物车数量
     * @param data 要渲染的对象
     * @param num 1或-1
     * @param price 菜品单价
     */
    updateTotalPrice(data = {}, num, price) {
        let that = this,
            totalPrice = that.data.totalPrice,
            counts = that.data.shopCart.length,
            _foodListObj = that.data._foodListObj,
            shopCart = that.data.shopCart,
            _findFoodCatalogList = that.data._findFoodCatalogList,
            amount = that.data.amount;
        if (utilCommon.isNumberOfNaN(num)) {
            if (num > 0) {
                totalPrice += price;
                amount++;
            } else {
                totalPrice -= price;
                amount--;
            }
            if (amount < 0) {
                amount = 0;
            }
            if (totalPrice < 0) {
                totalPrice = 0;
            }
        } else {
            totalPrice = 0;
            counts = 0;
            amount = 0;
            for (let k in _foodListObj) {
                data[`_foodListObj.${k}.count`] = 0;
                data[`_foodListObj.${k}.amount`] = 0;
            }
            for (let key in _findFoodCatalogList) {
                data[`_findFoodCatalogList.${key}.count`] = 0;
            }
        }
        let diff = util.money(that.data.deliveryAmount - totalPrice),
            isDeliveryAmount = false;
        if (diff <= 0) {
            isDeliveryAmount = true;
        }
        that.setData(Object.assign(data, {
            totalPrice,
            counts,
            amount,
            isDeliveryAmount
        }));
        that.setShopCart();
    },
    /**
     * 非规格菜品添加进购物车
     * @param num
     * @param e
     */
    plusToShopCart(num, e) {
        if (!this.data.isPlusToShopCart) {
            return;
        }
        this.data.isPlusToShopCart = false;
        let that = this,
            shopCart = that.data.shopCart,
            dishesTab = that.data.dishesTab,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj,
            index = e.currentTarget.dataset.index,
            value = e.currentTarget.dataset.value,
            isAdded = that.getShopCartIndex(value);
        let info = {
            count: 0,
            amount: 0,
            totalPrice: 0,
            price: 0,
            rulePrice: 0,
            dishesTab: util.extend(true, {}, dishesTab),
            index,
            foodCode: value.foodCode
        };
        if (-1 === isAdded) {
            _foodListObj[value.foodCode] = info;
            isAdded = shopCart.length;
        }
        let count = 0,
            amount = 0;
        if (_foodListObj[value.foodCode] && value.foodCode === _foodListObj[value.foodCode].foodCode) {
            count = Number(_foodListObj[value.foodCode].count) || 0;
            amount = Number(_foodListObj[value.foodCode].amount) || 0;
        }
        count += num;
        amount += num;
        if (count < 0) {
            count = 0;
        }
        if (amount < 0) {
            amount = 0;
        }
        that.isGetRule(index, function (rsp) {
            that.data.isPlusToShopCart = true;
            let food = foodListObj[dishesTab.code][index],
                currentFood = util.extend(true, {}, food),
                price = food.price,
                data = {};
            if (rsp.code !== 0) {
                _foodListObj[value.foodCode].amount = amount;
                Object.assign(data, {
                    [`_foodListObj.${value.foodCode}.count`]: count,
                    [`_findFoodCatalogList.${dishesTab.code}.count`]: that.setTabNumber(num),
                });
                if (food.rule && food.rule.ruleCode) {
                    price = food.rule.price;
                }
                _foodListObj[value.foodCode].price = price;//单价
                _foodListObj[value.foodCode].totalPrice = util.money(price * count);//单品总价
                currentFood.info = _foodListObj[value.foodCode];
                shopCart[isAdded] = currentFood;
                if (count <= 0) {
                    shopCart.splice(isAdded, 1);//当数量为0时，删除购物车中的菜品
                }
                that.updateTotalPrice(data, num, price);//单独更新总价与购物车数量
            }
        })
    },
    addToCart(num, e) {
        if (!this.data.isPlusToShopCart) {
            return;
        }
        this.data.isPlusToShopCart = false;
        let that = this,
            shopCart = that.data.shopCart,
            index = e.currentTarget.dataset.index,
            value = e.currentTarget.dataset.value,
            info = util.extend(true, {}, value.info),
            dishesTab = value.info.dishesTab,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj;
        let count = Number(info.count) || 0,
            amount = 0;
        if (_foodListObj[value.foodCode] && value.foodCode === _foodListObj[value.foodCode].foodCode) {
            amount = Number(_foodListObj[value.foodCode].amount) || 0;
        }
        count += num;
        amount += num;
        if (count < 0) {
            count = 0;
        }
        if (amount < 0) {
            amount = 0;
        }
        let price = info.price,
            data = {};
        Object.assign(data, {
            [`_foodListObj.${value.foodCode}.amount`]: amount,
            [`_findFoodCatalogList.${dishesTab.code}.count`]: that.setTabNumber(num, dishesTab),
        });
        if (value.rule && value.rule.ruleCode) {
            price = value.rule.price;
        }
        if (count <= 0) {
            shopCart.splice(index, 1);//当数量为0时，删除购物车中的菜品
            if (shopCart.length === 0) {
                that.shopCartBtn(true);
            } else {
                Object.assign(data, {
                    shopCart: that.data.shopCart
                });
            }
        } else {
            Object.assign(data, {
                [`shopCart[${index}].info.price`]: price,//单价
                [`shopCart[${index}].info.count`]: count,//单价
                [`shopCart[${index}].info.totalPrice`]: util.money(price * count),//单品总价
            });
        }
        that.updateTotalPrice(data, num, price);//单独更新总价与购物车数量
        that.data.isPlusToShopCart = true;
    },
    /**
     * 是否需要获取规格信息
     * @param index 菜品索引
     * @param cb 回调
     */
    isGetRule(index) {
        let cb, dishesTab;
        for (let i = 1; i < arguments.length; i++) {
            if (!cb && utilCommon.isFunction(arguments[i])) {
                cb = arguments[i];
            } else if (!dishesTab && utilCommon.isEmptyObject(arguments[i])) {
                dishesTab = arguments[i];
            }
        }
        dishesTab = dishesTab || this.data.dishesTab;
        let that = this,
            memberType = that.data.memberCardDto.memberType,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj,
            food = foodListObj[dishesTab.code][index],
            foodInfo = _foodListObj[food.foodCode],
            flag = false,
            code = 0;
        if (food && food.foodRuleCount > 0) {
            if (food.rule && food.rule.ruleCode && foodInfo.ruleList && foodInfo.ruleList.length > 0) {
                cb && cb({status: true, code: 2});
            } else {
                ApiService.getFoodRuleList(
                    {
                        resId: that.data.resId,
                        objId: that.data.objId,
                        foodCode: food.foodCode,
                        memberType,
                        config: {
                            isLoading: true
                        }
                    },
                    (rsp) => {
                        if (2000 == rsp.code && rsp.value && rsp.value.length > 0) {
                            _foodListObj[food.foodCode].ruleList = rsp.value;
                            food.rule = rsp.value[0];
                            food.ruleCode = rsp.value[0].ruleCode;
                            flag = true;
                            code = 3;
                        }
                    },
                    () => {
                        cb && cb({status: flag, code});
                    }
                )
            }
        } else {
            cb && cb({status: false, code: 1});
        }
    },
    /**
     * 是否需要口味信息
     * @param index 菜品索引
     * @param cb 回调
     */
    isGetPractices(index) {
        let cb, dishesTab;
        for (let i = 1; i < arguments.length; i++) {
            if (!cb && utilCommon.isFunction(arguments[i])) {
                cb = arguments[i];
            } else if (!dishesTab && utilCommon.isEmptyObject(arguments[i])) {
                dishesTab = arguments[i];
            }
        }
        dishesTab = dishesTab || this.data.dishesTab;
        let that = this,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj,
            food = foodListObj[dishesTab.code][index],
            foodInfo = _foodListObj[food.foodCode],
            flag = false,
            code = 0;
        if (food && food.foodPracticesCount > 0) {
            if (foodInfo.practicesList && foodInfo.practicesList.length > 0) {
                cb && cb({status: true, code: 2});
            } else {
                ApiService.getFoodPracticesList(
                    {
                        resId: that.data.resId,
                        objId: that.data.objId,
                        foodCode: food.foodCode,
                        config: {
                            isLoading: true
                        }
                    },
                    (rsp) => {
                        if (2000 == rsp.code && rsp.value && rsp.value.length > 0) {
                            _foodListObj[food.foodCode].practicesList = rsp.value;
                            flag = true;
                            code = 3;
                        }
                    },
                    () => {
                        cb && cb({status: flag, code});
                    }
                )
            }
        } else {
            cb && cb({status: false, code: 1});
        }
    },
    /**
     * 打开规格弹框事件
     * @param e
     */
    OpenRuleBtn(e) {
        let that = this,
            value = e.currentTarget.dataset.value,
            index = e.currentTarget.dataset.index,
            dishesTab = that.data.dishesTab,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj,
            flagArr = [false, false],
            info = {
                practicesList: [],//备注&&口味
                practicesLength: 0,
                ruleList: [],//规格
                count: 0,
                amount: 0,
                totalPrice: 0,
                price: 0,
                rulePrice: 0,
                dishesTab: util.extend(true, {}, dishesTab),
                index,
                foodCode: value.foodCode
            },
            obj = {
                isLoading: true,
                isDisabled: false,
                isAnimated: true,
                title: value.name,
                data: {
                    value,
                    info
                },
                footer: ['确定'],
                tableContent: 'table-rule',
            };
        Object.assign(obj.data.value, {
            rule: {},//规格
            ruleCode: '',//规格code
            practices: [],//备注&&口味code
            practicesList: [],//备注&&口味
        });
        that.utilPage_openModule('moduleRule');//打开弹框

        if (!_foodListObj[value.foodCode]) {
            _foodListObj[value.foodCode] = util.extend(true, {}, info);
        }

        that.isGetRule(index, function (rsp) {
            flagArr[0] = true;
            if (rsp.code === 0) {
                obj.isDisabled = true;
            }
            let foodInfo = _foodListObj[value.foodCode];
            if (rsp.status) {
                obj.data.info.ruleList = foodInfo.ruleList || [];
                if (foodInfo.ruleList && foodInfo.ruleList.length > 0) {
                    obj.data.value.rule = foodInfo.ruleList[0];
                    obj.data.value.ruleCode = foodInfo.ruleList[0].ruleCode;
                }
            }
            setData();
        });

        that.isGetPractices(index, function (rsp) {
            flagArr[1] = true;
            if (rsp.code === 0) {
                obj.isDisabled = true;
            }
            let foodInfo = _foodListObj[value.foodCode],
                data = foodInfo.practicesList || [];
            if (rsp.status) {
                obj.data.info.practicesLength = 0;
                if (data && data.length > 0) {
                    for (let i = 0, len = data.length; i < len; i++) {
                        if (data[i].foodPracticesList && data[i].foodPracticesList.length > 0) {
                            obj.data.info.practicesLength++;
                            obj.data.info.practicesList.push(data[i]);
                            obj.data.value.practicesList.push(data[i].foodPracticesList[0]);
                            obj.data.value.practices.push(data[i].foodPracticesList[0].practicesCode);
                        }
                    }
                }
            }
            setData();
        });

        function setData() {
            if (flagArr[0] && flagArr[1]) {
                if (obj.isDisabled) {
                    that.utilPage_closeModule('moduleRule');//关闭弹框
                }
                that.setData({
                    moduleRuleData: obj
                });
            }
        }
    },
    /**
     * 规格&做法btn
     * @param e
     * @param text
     */
    setShopOneData(e, text) {
        let that = this,
            index = null,
            moduleRuleData = that.data.moduleRuleData,
            value = e.currentTarget.dataset.value,
            flag = true;
        if (text === 'practices') {
            index = e.currentTarget.dataset.index.split(',');
            let list = moduleRuleData.data.info[text + 'List'][index[0]].foodPracticesList;
            if (moduleRuleData.data.value[text + 'List'][index[0]].id === value.id) {
                flag = false;
            }
            if (flag) {
                moduleRuleData.data.value[text + 'List'][index[0]] = value;
                moduleRuleData.data.value[text][index[0]] = value.practicesCode;
                that.setData({
                    [`moduleRuleData.data.value.${text + 'List'}[${index[0]}].id`]: value.id
                });
            } else {
                moduleRuleData.data.value[text][index[0]] = '';
                that.setData({
                    [`moduleRuleData.data.value.${text + 'List'}[${index[0]}]`]: {}
                });
            }
        } else if (text === 'rule') {
            index = e.currentTarget.dataset.index;
            moduleRuleData.data.value[text] = value;
            moduleRuleData.data.value[text + 'Code'] = value.ruleCode;
            that.setData({
                [`moduleRuleData.data.value.${text}.id`]: value.id,
                [`moduleRuleData.data.value.${text}.price`]: value.price,
                [`moduleRuleData.data.value.${text}.status`]: value.status,
                [`moduleRuleData.data.value.${text}.minMemberPrice`]: value.minMemberPrice,
            });
        }
    },
    /**
     * 规格菜品添加购物车
     * @param num
     * @param e
     */
    ruleToCarts(rsp) {
        let that = this,
            shopCart = that.data.shopCart,
            dishesTab = that.data.dishesTab,
            _foodListObj = that.data._foodListObj,
            value = rsp.value,
            info = util.extend(true, {}, rsp.info),
            isAdded = that.getShopCartIndex(value),
            amount = 0,
            count = 0;
        if (_foodListObj[value.foodCode] && value.foodCode === _foodListObj[value.foodCode].foodCode) {
            count = Number(_foodListObj[value.foodCode].count) || 0;
            amount = Number(_foodListObj[value.foodCode].amount) || 0;
        }
        if (-1 === isAdded) {
            _foodListObj[value.foodCode] = info;
            isAdded = shopCart.length;
            count = 0;
        } else {
            _foodListObj[value.foodCode] = util.extend(true, {}, shopCart[isAdded].info);
            count = Number(_foodListObj[value.foodCode].count) || 0;
        }

        count++;
        amount++;

        let currentFood = util.extend(true, {}, value),
            price = value.price,
            data = {};
        _foodListObj[value.foodCode].count = count;
        Object.assign(data, {
            [`_foodListObj.${value.foodCode}.amount`]: amount,
            [`_findFoodCatalogList.${dishesTab.code}.count`]: that.setTabNumber(1),
        });
        if (value.rule && value.rule.ruleCode) {
            price = value.rule.price;
        }
        _foodListObj[value.foodCode].price = price;//单价
        _foodListObj[value.foodCode].totalPrice = util.money(price * count);//单品总价
        currentFood.info = _foodListObj[value.foodCode];
        shopCart[isAdded] = currentFood;
        if (count <= 0) {
            shopCart.splice(isAdded, 1);//当数量为0时，删除购物车中的菜品
        }
        that.updateTotalPrice(data, 1, price);//单独更新总价与购物车数量
    },
    /**
     * 是否需要套餐子菜
     * @param index 菜品索引
     * @param cb 回调
     */
    isGetFoodPackages(index) {
        let cb, dishesTab;
        for (let i = 1; i < arguments.length; i++) {
            if (!cb && utilCommon.isFunction(arguments[i])) {
                cb = arguments[i];
            } else if (!dishesTab && utilCommon.isEmptyObject(arguments[i])) {
                dishesTab = arguments[i];
            }
        }
        dishesTab = dishesTab || this.data.dishesTab;
        let that = this,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj,
            food = foodListObj[dishesTab.code][index],
            foodInfo = _foodListObj[food.foodCode],
            flag = false,
            code = 0;

        if (food && food.foodType == 2) {
            if (foodInfo.foodPackagesList && foodInfo.foodPackagesList.length > 0) {
                cb && cb({status: true, code: 2});
            } else {
                ApiService.findFoodPackage(
                    {
                        resId: that.data.resId,
                        parentCode: food.foodCode,
                        config: {
                            isLoading: true
                        }
                    },
                    (rsp) => {
                        if (2000 == rsp.code && rsp.value && rsp.value.length > 0) {
                            _foodListObj[food.foodCode].foodPackagesList = rsp.value;
                            flag = true;
                            code = 3;
                        }
                    },
                    () => {
                        cb && cb({status: flag, code});
                    }
                )
            }
        } else {
            cb && cb({status: false, code: 1});
        }
    },
    /**
     * 打开套餐弹框事件
     * @param e
     */
    openPackageBtn(e) {
        let that = this,
            value = e.currentTarget.dataset.value,
            index = e.currentTarget.dataset.index,
            dishesTab = that.data.dishesTab,
            foodListObj = that.data.foodListObj,
            _foodListObj = that.data._foodListObj,
            flagArr = [false, false],
            info = {
                foodPackagesList: [],//备注&&口味
                practicesLength: 0,
                ruleList: [],//规格
                count: 0,
                amount: 0,
                totalPrice: 0,
                price: 0,
                rulePrice: 0,
                dishesTab: util.extend(true, {}, dishesTab),
                index,
                foodCode: value.foodCode
            },
            obj = {
                isLoading: true,
                isDisabled: false,
                isAnimated: true,
                title: value.name,
                data: {
                    value,
                    info
                },
                footer: ['确定'],
                tableContent: 'table-package',
            };
        Object.assign(obj.data.value, {
            rule: {},//规格
            ruleCode: '',//规格code
            foodPackages: [],//备注&&口味code
            foodPackagesList: [],//备注&&口味
        });
        that.utilPage_openModule('modulePackage');//打开弹框

        if (!_foodListObj[value.foodCode]) {
            _foodListObj[value.foodCode] = util.extend(true, {}, info);
        }

        that.isGetRule(index, function (rsp) {
            flagArr[0] = true;
            if (rsp.code === 0) {
                obj.isDisabled = true;
            }
            let foodInfo = _foodListObj[value.foodCode];
            if (rsp.status) {
                obj.data.info.ruleList = foodInfo.ruleList || [];
                if (foodInfo.ruleList && foodInfo.ruleList.length > 0) {
                    obj.data.value.rule = foodInfo.ruleList[0];
                    obj.data.value.ruleCode = foodInfo.ruleList[0].ruleCode;
                }
            }
            setData();
        });

        that.isGetFoodPackages(index, function (rsp) {
            flagArr[1] = true;
            if (rsp.code === 0) {
                obj.isDisabled = true;
            }
            let foodInfo = _foodListObj[value.foodCode],
                data = foodInfo.foodPackagesList || [];
            if (rsp.status) {
                obj.data.info.foodPackagesLength = 0;
                if (data && data.length > 0) {
                    for (let i = 0, len = data.length; i < len; i++) {
                        if (data[i].value && data[i].value.length > 0) {
                            obj.data.info.foodPackagesLength++;
                            obj.data.info.foodPackagesList.push(data[i]);
                            data[i].value[0].checkedId = data[i].value[0].foodCode + data[i].value[0].ruleCode;
                            obj.data.value.foodPackagesList.push(data[i].value[0]);
                            obj.data.value.foodPackages.push({
                                "foodCode": data[i].value[0].foodCode,
                                "ruleCode": data[i].value[0].ruleCode,
                                "foodCount": data[i].value[0].foodCount
                            });
                        }
                    }
                }
            }
            setData();
        });

        function setData() {
            if (flagArr[0] && flagArr[1]) {
                if (obj.isDisabled) {
                    that.utilPage_closeModule('modulePackage');//关闭弹框
                }
                obj.isLoading = true;
                that.setData({
                    modulePackageData: obj
                });
            }
        }
    },
    /**
     * 设置套餐子菜
     * @param e
     * @param text
     */
    setPackageData(e) {
        let that = this,
            index = null,
            modulePackageData = that.data.modulePackageData,
            value = e.currentTarget.dataset.value;
        index = e.currentTarget.dataset.index.split(',');
        let list = modulePackageData.data.info.foodPackagesList[index[0]].value;
        that.setData({
            [`modulePackageData.data.value.foodPackagesList[${index[0]}]`]: value,
            [`modulePackageData.data.value.foodPackagesList[${index[0]}].checkedId`]: value.foodCode + value.ruleCode,
            [`modulePackageData.data.value.foodPackages[${index[0]}]`]: {
                "foodCode": value.foodCode,
                "ruleCode": value.ruleCode,
                "foodCount": value.foodCount
            }
        });
    },
    /**
     * 套餐添加购物车
     * @param num
     * @param e
     */
    packageToCarts(rsp) {
        let that = this,
            shopCart = that.data.shopCart,
            dishesTab = that.data.dishesTab,
            _foodListObj = that.data._foodListObj,
            value = rsp.value,
            info = util.extend(true, {}, rsp.info),
            isAdded = that.getShopCartIndex(value),
            amount = 0,
            count = 0;
        if (_foodListObj[value.foodCode] && value.foodCode === _foodListObj[value.foodCode].foodCode) {
            count = Number(_foodListObj[value.foodCode].count) || 0;
            amount = Number(_foodListObj[value.foodCode].amount) || 0;
        }
        if (-1 === isAdded) {
            _foodListObj[value.foodCode] = info;
            isAdded = shopCart.length;
            count = 0;
        } else {
            _foodListObj[value.foodCode] = util.extend(true, {}, shopCart[isAdded].info);
            count = Number(_foodListObj[value.foodCode].count) || 0;
        }

        count++;
        amount++;

        let currentFood = util.extend(true, {}, value),
            price = value.price,
            data = {};
        _foodListObj[value.foodCode].count = count;
        Object.assign(data, {
            [`_foodListObj.${value.foodCode}.amount`]: amount,
            [`_findFoodCatalogList.${dishesTab.code}.count`]: that.setTabNumber(1),
        });
        if (value.rule && value.rule.ruleCode) {
            price = value.rule.price;
        }
        _foodListObj[value.foodCode].price = price;//单价
        _foodListObj[value.foodCode].totalPrice = util.money(price * count);//单品总价
        currentFood.info = _foodListObj[value.foodCode];
        shopCart[isAdded] = currentFood;
        if (count <= 0) {
            shopCart.splice(isAdded, 1);//当数量为0时，删除购物车中的菜品
        }
        that.updateTotalPrice(data, 1, price);//单独更新总价与购物车数量
    },
    /**
     * 打开购物车按钮
     */
    shopCartBtn(status) {
        let that = this;
        if (that.data.shopCartModule && that.data.shopCartModule.length > 0) {
            if (status) {
                that.setData({
                    shopCart: that.data.shopCart
                });
            }
            that.utilPage_closeModule("shopCartModule");
        } else {
            if (that.data.shopCart.length > 0) {
                that.setData({
                    shopCart: that.data.shopCart
                });
                that.utilPage_openModule("shopCartModule");
            }
        }

    },
    /**
     * 清除购物车
     */
    clearShopCart() {
        if (this.data.shopCart.length === 0) {
            return;
        }
        let that = this,
            resId = that.data.resId,
            orderList = that.data.orderList,
            _foodListObj = that.data._foodListObj,
            orderString = that.data.orderString.str;
        wx.showModal({
            title: '提示',
            content: '是否清除购物车',
            success: function (res) {
                if (res.confirm) {
                    app.globalData.shopCarts[resId][orderString].list = [];
                    app.globalData.shopCarts[resId][orderString].totalPrice = 0;
                    app.globalData.shopCarts[resId][orderString].counts = 0;
                    app.globalData.shopCarts[resId][orderString].amount = 0;
                    app.setShopCartsStorage();
                    that.utilPage_closeModule('shopCartModule');//关闭购物车
                    that.data.shopCart = [];
                    that.updateTotalPrice({shopCart: []});
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },
    /**
     * 提交订单
     */
    submit() {
        let that = this,
            shopCart = that.data.shopCart,
            orderType = that.data.orderType,
            resId = that.data.resId;
        if (!that.data.isShow) {
            return;
        }
        if (!utilCommon.isArray(shopCart) || shopCart.length == 0) {
            wx.showToast({
                title: '还没点餐,请点餐',
                icon: 'success',
                duration: 2000
            })
        } else if (!this.data.isDeliveryAmount) {
            wx.showToast({
                title: '还未达到起送金额',
                icon: 'success',
                duration: 2000
            })
        } else {
            let url = '/pages/shop/confirm-order/confirm-order';
            let typeText = null;
            if (3 === orderType && that.data.isConsumerId === 1) {
                typeText = 'blank';
            }
            util.go(url, {
                type: typeText,
                data: {
                    resId,
                    orderType
                }
            });
        }
    },
    updateData(str, data) {
        this.setData({
            [str]: data
        })
    },
    /**
     * 获取用户订单信息
     */
    getUserOrderInfo() {
        let that = this,
            options = that.data.options,
            orderType = that.data.orderType,
            status = 0;
        app.globalData.userOrderInfo = {};
        if (!!utilCommon.isFalse(options.consumerId) && !!utilCommon.isFalse(options.tableCode)) {
            status = 1;
        } else if (!!utilCommon.isFalse(options.tableCode)) {
            status = 2;
        }
        if (status > 0) {
            that.data.isAddFood = true;
        }
        let tableName = utilCommon.isFalse(options.tableName);
        if (tableName && tableName.length > 0) {
            tableName = decodeURIComponent(tableName);
        }
        app.globalData.userOrderInfo = {
            tableCode: utilCommon.isFalse(options.tableCode),
            name: tableName,
            consumerId: utilCommon.isFalse(options.consumerId),
            fNumber: Number(options.fNumber) || 1,
            status: status
        };

        if (0 == orderType) {
            ApiService.checkHasWaitPayConsumer(
                {
                    resId: that.data.resId,
                    objId: that.data.objId
                }, (rsp) => {
                    if (2000 == rsp.code && utilCommon.isEmptyValue(rsp.value)) {
                        // app.globalData.userOrderInfo = {
                        //     consumerId: rsp.value.consumerId,
                        //     tableCode: rsp.value.tableCode,
                        //     name: rsp.value.title,
                        //     fNumber: rsp.value.fNumber,
                        //     status: 1
                        // };
                        if (!that.data.isAddFood) {
                            that.data.isAddFood = true;
                            wx.showModal({
                                title: '提示',
                                content: '您存在未结算订单！！！',
                                confirmText: '去支付',
                                cancelText: '取消',
                                cancelColor: '#f74b7b',
                                success: function (res) {
                                    if (res.confirm) {
                                        util.go('/pages/order/order-detail/order-detail', {
                                            type: 'goOrder',
                                            data: {
                                                resId: that.data.resId,
                                                consumerId: rsp.value.consumerId
                                            }
                                        });
                                    } else if (res.cancel) {

                                    }
                                }
                            });
                        }
                    } else {
                        if (app.globalData.userOrderInfo && app.globalData.userOrderInfo.status === 2) {
                        } else {
                            app.globalData.userOrderInfo = {};
                        }
                    }
                });
        }
    },
};
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
    /**
     * 设置口味做法btn事件
     * @param e
     */
    bindAzmPopupPracticesBtn(e) {
        let _this = this;
        _this.setShopOneData(e, 'practices');
    },
    /**
     * 设置规格btn事件
     * @param e
     */
    bindAzmPopupRuleBtn(e) {
        let _this = this;
        _this.setShopOneData(e, 'rule');
    },
    /**
     * 设置套餐btn事件
     * @param e
     */
    bindAzmPopupPackageBtn(e) {
        let _this = this;
        _this.setPackageData(e);
    },
    /**
     * 弹窗提交
     * @param e
     */
    bindAzmModulePopupSubmit(e) {
        let that = this,
            data = e.currentTarget.dataset.value,
            type = e.currentTarget.dataset.type,
            value = null;
        if (that.data[type + 'Data'] && that.data[type + 'Data'].isLoading) {
            value = util.extend(true, {}, that.data[type + 'Data'].data);
        }
        if ('moduleRule' === type) {
            that.ruleToCarts(value);
        } else if ('modulePackage' === type) {
            that.packageToCarts(value);
        }
        that.bindAzmCloseMask();
    },
    /**
     * 打开选套餐菜弹框
     * @param e
     */
    bindOpenPackageBtn(e) {
        let _this = this;
        _this.openPackageBtn(e);
    },
    /**
     * 打开选规格菜弹框
     * @param e
     */
    bindOpenRuleBtn(e) {
        let _this = this;
        _this.OpenRuleBtn(e);
    },
    /**
     * 关闭所有弹窗
     */
    bindAzmCloseMask(e) {
        let _this = this;
        _this.utilPage_closeModule('moduleRule');//关闭规格弹框
        _this.utilPage_closeModule('modulePackage');//关闭套餐弹框
        _this.utilPage_closeModule('shopCartModule');//关闭购物车
    },
    /**
     * 打开购物车按钮
     * @param e
     */
    bindAzmShopCartBtn(e) {
        let _this = this;
        _this.shopCartBtn();
    },
    bindAzmSubmit(e) {
        let _this = this;
        _this.submit();
    },
    /**
     * 加菜按钮
     * @param e
     */
    bindPlusToShopCart(e) {
        let that = this,
            active = e.currentTarget.dataset.active;
        try {
            that[active](1, e);
        } catch (e) {
            console.warn(`不存在${active}函数`);
        }
    },
    /**
     * 减菜按钮
     * @param e
     */
    bindCutToShopCart(e) {
        let that = this,
            active = e.currentTarget.dataset.active;
        try {
            that[active](-1, e);
        } catch (e) {
            console.warn(`不存在${active}函数`);
        }
    }
};
Object.assign(appPage, methods, events);
Page(Object.assign(appPage, app.utilPage));