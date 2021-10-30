class MyDataBag {
    constructor(initValues) {
        if (initValues) {
            const keys = Object.keys(initValues);
            if (keys) {
                keys.forEach(key => {
                    this[key] = initValues[key];
                });
            }
        }
    }

    onchange = (propName, oldValue, newValue) => { };

    set msgPage(value) {
        if (value != this._msgPage) {
            this.onchange('msgPage', this._msgPage, value);
        }
        this._msgPage = value;
    }

    get msgPage() {
        return this._msgPage;
    }

    set msgPageSize(value) {
        if (value != this._msgPageSize) {
            this.onchange('msgPageSize', this._msgPageSize, value);
        }
        this._msgPageSize = value;
    }

    get msgPageSize() {
        return this._msgPageSize;
    }
}