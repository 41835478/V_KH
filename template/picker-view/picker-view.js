let EVENTS = {};

let pickerView = {
    azm_pickerView_show() {
        let that = this, data = arguments[0],
            obj = {
                type: data.type,
                isLoading: data.isLoading || true,
                isDisabled: false,
                isAnimated: data.isAnimated || false,
                title: data.title,
                data: data.data,
                tableContent: `picker-view-${data.type}`,
            };
        if (data.confirmText || data.cancelText) {
            obj.footer = {
                confirmText: data.confirmText || '是',
                cancelText: data.cancelText || '否',
                cancelColor: '#f74b7b',
                confirmColor: '#f74b7b',
                status: true
            }
        }
        if (!data.type) return;
        EVENTS.type = data.type;
        EVENTS.success = data.success;
        EVENTS.fail = data.fail;
        EVENTS.complete = data.complete;
        EVENTS.data = data.data;
        let _data = {
            isMask: true,
            isTemplate: true
        };
        _data[data.type] = data.type;
        _data[`isAnimated`] = true;
        if (that.data[`${data.type}Data`] && that.data[`${data.type}Data`].AnimatedTimeout) {
            clearTimeout(that.data[`${data.type}Data`].AnimatedTimeout);
            that.setData({
                [`${data.type}Data.isAnimated`]: false
            });
        }
        that.setData(Object.assign(_data, {
            [`${data.type}Data`]: obj
        }));
    },
    azm_pickerView_success(e) {
        let that = this,
            type = e.currentTarget.dataset.type,
            active = e.currentTarget.dataset.active,
            select = e.currentTarget.dataset.select,
            value = e.detail.value, confirm = false, cancel = false;
        try {
            if (!type) type = e.detail.target.dataset.type;
            that.azm_closeModule(EVENTS.type);//关闭弹框
        } catch (e) {
            console.log('azm_pickerView_success调用失败');
        }
        if (type === 'confirm') {
            confirm = true;
        } else if (type === 'confirm') {
            cancel = true;
        }
        EVENTS.success && EVENTS.success({
            confirm,
            cancel,
            active,
            select,
            value,
            data: EVENTS.data,
            target: e
        });
        EVENTS.complete && EVENTS.complete({
            confirm,
            cancel,
            active,
            select,
            value,
            data: EVENTS.data,
            target: e
        });
    },
    azm_pickerView_fail(e) {
        let that = this,
            type = e.currentTarget.dataset.type,
            select = e.currentTarget.dataset.select,
            active = e.currentTarget.dataset.active,
            cancel = true,
            value = e.detail.value;
        that.azm_closeModule(EVENTS.type);
        EVENTS.fail && EVENTS.fail({
            cancel,
            active,
            select,
            type,
            value,
            data: EVENTS.data,
            target: e
        });
        EVENTS.complete && EVENTS.complete({
            cancel,
            active,
            select,
            type,
            value,
            data: EVENTS.data,
            target: e
        });
    },
    /**
     * 关闭module-popup弹框
     * @param str
     * @param animated
     */
    azm_closeModule(str, animated) {
        let that = this;
        let data = {
            isMask: false,
            isTemplate: false,
        };
        if (that.data[`${str}Data`]) {
            that.data[`${str}Data`].AnimatedTimeout = setTimeout(() => {
                this.setData({
                    [`${str}Data.isAnimated`]: false
                });
            }, 300);
            that.setData({[`${str}Data.data`]: {}});
        }
        data[str] = '';
        this.setData(data);
    },
};

function PickerView() {
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];
    this.__page = curPage;
    Object.assign(curPage, pickerView);
    curPage.pickerView = this;
    return this;
}

module.exports = {
    PickerView
};