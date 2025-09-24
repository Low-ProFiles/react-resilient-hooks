export function openDB(dbName, version, upgradeCb) {
    if (version === void 0) { version = 1; }
    return new Promise(function (resolve, reject) {
        var req = indexedDB.open(dbName, version);
        req.onerror = function () { return reject(req.error); };
        req.onsuccess = function () { return resolve(req.result); };
        req.onupgradeneeded = function () { try {
            upgradeCb === null || upgradeCb === void 0 ? void 0 : upgradeCb(req.result);
        }
        catch (_a) { } };
    });
}
export function promisifyRequest(req) {
    return new Promise(function (resolve, reject) { req.onsuccess = function () { return resolve(req.result); }; req.onerror = function () { return reject(req.error); }; });
}
