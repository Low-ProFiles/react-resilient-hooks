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
var LocalStorageProvider = /** @class */ (function () {
    function LocalStorageProvider() {
    }
    LocalStorageProvider.prototype.getItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var raw;
            return __generator(this, function (_a) {
                try {
                    raw = localStorage.getItem(key);
                    if (!raw)
                        return [2 /*return*/, null];
                    return [2 /*return*/, JSON.parse(raw)];
                }
                catch (_b) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    LocalStorageProvider.prototype.setItem = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                localStorage.setItem(key, JSON.stringify(value));
                return [2 /*return*/];
            });
        });
    };
    LocalStorageProvider.prototype.removeItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                localStorage.removeItem(key);
                return [2 /*return*/];
            });
        });
    };
    return LocalStorageProvider;
}());
export { LocalStorageProvider };
var EncryptedLocalStorageProvider = /** @class */ (function () {
    function EncryptedLocalStorageProvider(passphrase) {
        var _this = this;
        this.prefix = "enc_v1_";
        EncryptedLocalStorageProvider.deriveKeyFromPassphrase(passphrase).then(function (_a) {
            var key = _a.key;
            _this.key = key;
        });
    }
    EncryptedLocalStorageProvider.deriveKeyFromPassphrase = function (passphrase, salt) {
        return __awaiter(this, void 0, void 0, function () {
            var enc, pwKey, s, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        enc = new TextEncoder();
                        return [4 /*yield*/, crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"])];
                    case 1:
                        pwKey = _a.sent();
                        s = salt !== null && salt !== void 0 ? salt : crypto.getRandomValues(new Uint8Array(16));
                        return [4 /*yield*/, crypto.subtle.deriveKey({ name: "PBKDF2", salt: s, iterations: 100000, hash: "SHA-256" }, pwKey, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])];
                    case 2:
                        key = _a.sent();
                        return [2 /*return*/, { key: key, salt: s }];
                }
            });
        });
    };
    EncryptedLocalStorageProvider.createFromPassphrase = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, key, salt, provider;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, EncryptedLocalStorageProvider.deriveKeyFromPassphrase(passphrase)];
                    case 1:
                        _a = _b.sent(), key = _a.key, salt = _a.salt;
                        provider = new EncryptedLocalStorageProvider(passphrase);
                        provider.key = key;
                        localStorage.setItem("__rrh_enc_salt__", JSON.stringify(Array.from(new Uint8Array(salt))));
                        return [2 /*return*/, provider];
                }
            });
        });
    };
    EncryptedLocalStorageProvider.createFromPassphraseWithStoredSalt = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var raw, salt, key, provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        raw = localStorage.getItem("__rrh_enc_salt__");
                        if (raw)
                            salt = new Uint8Array(JSON.parse(raw)).buffer;
                        return [4 /*yield*/, EncryptedLocalStorageProvider.deriveKeyFromPassphrase(passphrase, salt)];
                    case 1:
                        key = (_a.sent()).key;
                        provider = new EncryptedLocalStorageProvider(passphrase);
                        provider.key = key;
                        return [2 /*return*/, provider];
                }
            });
        });
    };
    EncryptedLocalStorageProvider.prototype.encryptObject = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var iv, enc, data, ct;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.key) {
                            throw new Error('Key is not derived yet');
                        }
                        iv = crypto.getRandomValues(new Uint8Array(12));
                        enc = new TextEncoder();
                        data = enc.encode(JSON.stringify(obj));
                        return [4 /*yield*/, crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, this.key, data)];
                    case 1:
                        ct = _a.sent();
                        return [2 /*return*/, { iv: Array.from(iv), data: Array.from(new Uint8Array(ct)) }];
                }
            });
        });
    };
    EncryptedLocalStorageProvider.prototype.decryptObject = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var iv, ct, dec, decStr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.key) {
                            throw new Error('Key is not derived yet');
                        }
                        iv = new Uint8Array(payload.iv);
                        ct = new Uint8Array(payload.data);
                        return [4 /*yield*/, crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, this.key, ct)];
                    case 1:
                        dec = _a.sent();
                        decStr = new TextDecoder().decode(dec);
                        return [2 /*return*/, JSON.parse(decStr)];
                }
            });
        });
    };
    EncryptedLocalStorageProvider.prototype.getItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var raw, payload, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        raw = localStorage.getItem(this.prefix + key);
                        if (!raw)
                            return [2 /*return*/, null];
                        payload = JSON.parse(raw);
                        return [4 /*yield*/, this.decryptObject(payload)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EncryptedLocalStorageProvider.prototype.setItem = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.encryptObject(value)];
                    case 1:
                        payload = _a.sent();
                        localStorage.setItem(this.prefix + key, JSON.stringify(payload));
                        return [2 /*return*/];
                }
            });
        });
    };
    EncryptedLocalStorageProvider.prototype.removeItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                localStorage.removeItem(this.prefix + key);
                return [2 /*return*/];
            });
        });
    };
    return EncryptedLocalStorageProvider;
}());
export { EncryptedLocalStorageProvider };
