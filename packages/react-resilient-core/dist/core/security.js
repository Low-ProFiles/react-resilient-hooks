var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DEFAULT_SENSITIVE_KEYWORDS = ["password", "passwd", "pwd", "token", "access_token", "refresh_token", "auth", "authorization"];
export function redactSensitiveFields(obj, extraKeys, customKeywords) {
    if (extraKeys === void 0) { extraKeys = []; }
    if (customKeywords === void 0) { customKeywords = []; }
    var keywords = new Set(__spreadArray(__spreadArray(__spreadArray([], DEFAULT_SENSITIVE_KEYWORDS, true), extraKeys, true), customKeywords, true).map(function (k) { return k.toLowerCase(); }));
    var walk = function (v) {
        if (v === null || v === undefined)
            return v;
        if (typeof v !== "object")
            return v;
        if (Array.isArray(v))
            return v.map(walk);
        var out = {};
        for (var _i = 0, _a = Object.entries(v); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], val = _b[1];
            out[k] = keywords.has(k.toLowerCase()) ? "[REDACTED]" : walk(val);
        }
        return out;
    };
    return walk(obj);
}
