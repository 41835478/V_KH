let scope = {
    userInfo: 'scope.userInfo',//用户信息
    userLocation: 'scope.userLocation',//地理位置
    address: 'scope.address',//通讯地址
    invoiceTitle: 'scope.invoiceTitle',//发票抬头
    werun: 'scope.werun',//微信运动步数
    record: 'scope.record',//录音功能
    writePhotosAlbum: 'scope.writePhotosAlbum',//保存到相册
};


module.exports = {
    authSetting: null,
    getSetting() {
        let _this = this;
        return new Promise(function (resolve, reject) {
            let flag = false;
            wx.getSetting({
                success(res) {
                    console.log(res.authSetting, 'authSetting');
                    _this.authSetting = res.authSetting;
                    flag = true;
                },
                complete() {
                    if (flag) {
                        resolve();
                    } else {
                        reject();
                    }
                }
            })
        });
    },
    openSetting(scopeStr) {
        return new Promise(function (resolve, reject) {
            let flag = false;
            wx.openSetting({
                success(res) {
                    flag = res.authSetting[scopeStr];
                },
                complete() {
                    if (flag) {
                        resolve();
                    } else {
                        reject();
                    }
                }
            });
        });
    },
    setPromise(scopeStr) {
        let _this = this;
        return new Promise(function (resolve, reject) {
            _this.getSetting().then(function () {
                if (!_this.authSetting[scopeStr]) {
                    let flag = false;
                    wx.authorize({
                        scope: scopeStr,
                        success() {
                            flag = true;
                        },
                        complete(res) {
                            console.log(res);
                            if (flag) {
                                resolve();
                            } else {
                                _this.openSetting(scopeStr).then(function () {
                                    resolve();
                                }, function () {
                                    reject();
                                })
                            }
                        }
                    })
                } else {
                    resolve();
                }
            }, function () {
                reject();
            });
        });
    },
    userLocation() {
        let scopeStr = scope.userLocation;
        return this.setPromise(scopeStr);
    },
    userInfo() {
        let scopeStr = scope.userInfo;
        return this.setPromise(scopeStr);
    },
    address() {
        let scopeStr = scope.address;
        return this.setPromise(scopeStr);
    },
    invoiceTitle() {
        let scopeStr = scope.invoiceTitle;
        return this.setPromise(scopeStr);
    },
    werun() {
        let scopeStr = scope.werun;
        return this.setPromise(scopeStr);
    },
    record() {
        let scopeStr = scope.record;
        return this.setPromise(scopeStr);
    },
    writePhotosAlbum() {
        let scopeStr = scope.writePhotosAlbum;
        return this.setPromise(scopeStr);
    }
};