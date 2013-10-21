var Store = {
    initialize: function () {},
    getStore: function (e) {
        return {
            name: this.appName + "." + e
        };
    },
    set: function (e, t, n) {
        if (!this.isSet(e)) {
            var r = this.getStore(e);
            var i = {
                data: t,
                time: Math.floor(Date.now() / 1e3),
                period: n
            };
            window.localStorage[r.name] = JSON.stringify(i);
        }
    },
    get: function (e) {
        if (this.isSet(e)) {
            var t = this.getStore(e);
            var n = JSON.parse(window.localStorage[t.name]);
            return n.data;
        }
        return false;
    },
    clear: function (e) {
        var t = this.getStore(e);
        localStorage.removeItem(t.name);
    },
    clearAll: function () {
        var e = this.appName.length;
        var t = this.appName;
        Object.keys(localStorage).forEach(function (n) {
            if (n.substring(0, e) === t) localStorage.removeItem(n);
        });
    },
    isSet: function (e) {
        var t = this.getStore(e);
        var n = Math.floor(Date.now() / 1e3);
        if (window.localStorage[t.name] === undefined) {
            return false;
        }
        var r = JSON.parse(window.localStorage[t.name]);
        if (n - parseInt(r.time) > parseInt(r.period) && parseInt(r.period) !== 0) {
            this.clear(e);
            return false;
        }
        return true;
    }
};
Store.appName = "MedicineBOX";