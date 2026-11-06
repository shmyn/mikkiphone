/*
 * 배포 설정. GitHub Pages 주소가 정해지면 SITE_URL만 바꾼다.
 * 비밀 값(API 키, 토큰)은 이 저장소 어디에도 두지 않는다. 이 서비스는 그런 값이 필요 없다.
 */
(function (root) {
  "use strict";
  var CONFIG = Object.freeze({
    SITE_URL: "https://shmyn.github.io/mikkiphone/", // 예: "https://<깃허브아이디>.github.io/mikkiphone/" (끝에 / 포함)
    RING_SECONDS: 15,   // 전화가 울리는 시간. 지나면 부재중
    BANNER_MS: 4500,    // 알림 배너가 떠 있는 시간. 지나면 앱 안에만 남는다
    LINE_MS: 1700       // 통화 대사 한 줄이 나오는 간격
  });
  if (typeof module !== "undefined" && module.exports) module.exports = CONFIG;
  else root.MK_CONFIG = CONFIG;
})(this);
