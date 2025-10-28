var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useCallback } from 'react';
export function useRetry(fn, retries, retryDelay, backoff) {
    var _this = this;
    if (retries === void 0) { retries = 3; }
    if (retryDelay === void 0) { retryDelay = 1000; }
    if (backoff === void 0) { backoff = 'exponential'; }
    var _a = useState({ data: null, error: null, loading: false }), state = _a[0], setState = _a[1];
    var run = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var attempt, _loop_1, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState({ data: null, error: null, loading: true });
                    attempt = 0;
                    _loop_1 = function () {
                        var result, err_1, delay_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 6]);
                                    return [4 /*yield*/, fn()];
                                case 1:
                                    result = _b.sent();
                                    setState({ data: result, error: null, loading: false });
                                    return [2 /*return*/, { value: void 0 }];
                                case 2:
                                    err_1 = _b.sent();
                                    attempt++;
                                    if (!(attempt >= retries)) return [3 /*break*/, 3];
                                    setState({ data: null, error: err_1, loading: false });
                                    return [3 /*break*/, 5];
                                case 3:
                                    delay_1 = backoff === 'exponential' ? retryDelay * Math.pow(2, attempt - 1) : retryDelay;
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, delay_1); })];
                                case 4:
                                    _b.sent();
                                    _b.label = 5;
                                case 5: return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 1;
                case 1:
                    if (!(attempt < retries)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [fn, retries, retryDelay, backoff]);
    return __assign(__assign({}, state), { retry: run });
}
