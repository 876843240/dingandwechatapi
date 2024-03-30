// 钉钉
import * as dingtalk from "dingtalk-jsapi";
import getPlat from "./checkPlat";
import getBroswer from "./checkBroswer";
const urls = {
  dingtalk: {
    login: "/api/dingtalk/rest/dingTalk/v2/app/login",
  },
  wxwork: {
    login: "/api/dingtalk/rest/tencent/wechat/login",
  },
  weixin: {
    login: "/api/dingtalk/rest/tencent/wechat/login",
  },
};
const sdks = {
  dingtalk,
};
const methods = {
  dingtalk: {
    storageGetItem: "util.domainStorage.getItem",
    storageSetItem: "util.domainStorage.setItem",
    storageRemoveItem: "util.domainStorage.removeItem",
    closeProgram: "biz.navigation.close",
  },
};
const plat = getPlat();
const broswerInfo = getBroswer();
export default {
  plat,
  broswerInfo,
  sdk: sdks[plat],
  urls: urls[plat],
  methods,
};
