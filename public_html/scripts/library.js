function sortByKey(e, t) {
    return e.sort(function (e, n) {
        var r = e[t];
        var i = n[t];
        return r < i ? -1 : r > i ? 1 : 0
    })
}

function getObjects(e, t, n, c, r) {
    if (typeof r == "undefined") {
        r = "similar"
    }
    if (typeof n == "string") {
        n = n.toLowerCase()
    }
    var i = [];
    for (var s in e) {
        if (!e.hasOwnProperty(s)) continue;
        if (typeof e[s] == "object") {
            i = i.concat(getObjects(e[s], t, n, c, r))
        } else {
            if (s !== t) continue;
            if (r == "similar") {
                if (e[t].toLowerCase().indexOf(n) !== -1) {
                    i.push(e)
                }
            } else {
                if (typeof e[t] == "string") {
                    if (e[t].toLowerCase() === n) {
                        i.push(e)
                    }
                }
            }
            if(typeof c !== "undefined") {
                if(i.length >= c) {
                    return i;
                }
            }
        }
    }
    return i
}

function getObject(e, t, n) {
    if (typeof n == "string") {
        n = n.toLowerCase()
    }
    for (var r in e) {
        if (!e.hasOwnProperty(r)) continue;
        if (typeof e[r] == "object") {
            for (var i in e[r]) {
                if (i !== t) continue;
                if (typeof e[r][t] == "string") {
                    if (e[r][t].toLowerCase() == n) {
                        return r
                    }
                } else {
                    if (e[r][t] == n) {
                        return r
                    }
                }
            }
        }
    }
    return false
}

function getDistinct(e, t) {
    var n = [];
    $.each(e, function (e, r) {
        if ($.inArray(r[t], n) == -1) {
            n.push(r[t])
        }
    });
    return n
}

function removeElement(e, t, n) {
    $.each(e, function (r, i) {
        if (i[t] == n) {
            delete e[r]
        }
    });
    return e
}
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

function search(arr, key, query, limit, otherKey) {
    query = query.toLowerCase();
    return grep(arr, function(e) {
        if(e[key].toLowerCase().indexOf(query) === 0){
            return true;
        } else if(typeof otherKey !== "undefined") {
            if(e[otherKey].toLowerCase().indexOf(query) === 0) {
                return true;
            }
        }
        return false;
    }, limit);
}

function grep(arr,fn, ct, n){
    var r,i=[],s=0,o=arr.length;
    n=!!n;
    if(typeof ct === "undefined") {
        ct = -1;
    }
    for(;s<o;s++){
        r=!!fn(arr[s],s);
        if(n!==r){
            i.push(arr[s])
        }
        if(ct > 0 && i.length >= ct) {
            return i;
        }
    }
    return i
}
