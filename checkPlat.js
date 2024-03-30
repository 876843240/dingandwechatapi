export default function getPlat() {
  let platform = "H5";
  let ua = navigator.userAgent.toLowerCase(); //判断浏览器的类型
  if (ua.match(/Alipay/i) == "alipay") {
    //支付宝
    platform = "Alipay";
  } else if (
    ua.match(/MicroMessenger/i) == "micromessenger" &&
    ua.match(/wxwork/i) == "wxwork"
  ) {
    //企业微信
    platform = "wxwork";
  } else if (ua.match(/MicroMessenger/i) == "micromessenger") {
    //微信
    platform = "weixin";
  } else if (ua.match(/DingTalk/i) == "dingtalk") {
    //钉钉
    platform = "dingtalk";
  } else if (ua.match(/TaurusApp/i) == "taurusapp") {
    //专有钉钉
    platform = "taurusapp";
  } else if (window.__wxjs_environment == "miniprogram") {
    //微信小程序
    platform = "miniprogram";
  }
  if (process.env.NODE_ENV === "dingtalk") {
    platform = "dingtalk";
  }
  return platform;
}
