# 이미지 및 아이콘 출처

이 프로젝트는 실제 서비스가 아닌 비상업적 포트폴리오용 시뮬레이션입니다. 브랜드는 화면을 알아보기 위한 참조이며, 사건·메시지·계정은 가상입니다.

## 사진

`assets/photos/*.jpg`는 Unsplash에서 내려받은 사진입니다. 사진 사용 조건: https://unsplash.com/license
각 원본 다운로드 주소는 `assets/sources.json`에 보관했습니다. 화면 속 인물은 스톡 사진 모델이며 프로젝트를 추천하거나 관련 사건에 참여한 인물이 아닙니다.

| 파일 | 표시 위치 / 실제 피사체 |
| --- | --- |
| sea.jpg | 갤러리·X / 해변과 파도 |
| cat.jpg | 갤러리·X·카메라 샘플 장면 / 고양이 |
| mountain.jpg | 갤러리·지수의 채팅 사진·블로그 / 산 풍경 |
| cafe.jpg | 갤러리 / 커피 |
| friends.jpg | PC 단체사진·갤러리 / 친구들의 단체사진 |
| team.jpg | PC 프로젝트 회의 사진 / 업무 회의 |
| food.jpg | 갤러리·블로그 / 샐러드 식사 |
| knit.jpg | 쿠팡·카카오톡 쇼핑 샘플 / 아이보리 니트 |
| workspace.jpg | 카메라 샘플 장면·블로그 / 작업 공간 |
| wedding.jpg | 청첩장 링크 미리보기 / 결혼 사진 |

크기와 압축률은 Unsplash 이미지 서비스의 변환 옵션으로 조정했습니다. 사람이나 사진의 의미를 왜곡하는 합성은 하지 않았습니다.

## 브랜드 표지

- 카카오톡·네이버·X: Simple Icons, CC0 1.0. https://simpleicons.org / https://github.com/simple-icons/simple-icons
- Simple Icons 라이선스 사본: `assets/brands/simple-icons-LICENSE.md`. 아이콘 파일에는 타일색에 맞춘 채움색을 적용했습니다.
- Chrome·Gmail: Google 공식 이미지 파일. 원본 주소는 `assets/sources.json` 참고.
- 쿠팡: Coupang 공식 CDN의 로고 파일. 원본 주소는 `assets/sources.json` 참고.
- 현재 사용하는 카카오톡·토스·블로그·쿠팡·지도·X·Chrome·Gmail 앱 표지는 Apple App Store 공식 배포 이미지입니다. 원본 URL과 공식 서비스 페이지는 `assets/sources.json`에 보관했습니다. 이들은 무료 스톡 이미지가 아닌 브랜드 참조 에셋입니다.
- 과거에 사용한 텍스트 토스 표지와 N 글자 블로그 표지는 실제 앱 아이콘으로 교체했습니다.
- 스토어 화면은 UI 구조 검토에만 사용했습니다. 원본 스크린샷을 앱 화면 대신 삽입하지 않았습니다.

사진의 무료 사용 조건이나 Simple Icons의 CC0는 기업 상표권이나 Google·쿠팡 로고에 대한 자유 라이선스를 뜻하지 않습니다. 브랜드 표지는 비공식 서비스 화면을 식별하는 참조용이며, 에셋의 소유권은 각 권리자에게 있습니다.

## 구현

실행 중 이미지 다운로드나 외부 서비스 호출이 없습니다. 에셋은 로컬 파일로 포함하고, `dist/preview.html`에는 같은 에셋을 내장합니다. 좋아요·팔로우·공감은 세션 안에서만 바뀝니다.

## PC 투명 표지와 선명도 개선

PC의 Chrome·Gmail은 공식 투명 SVG를 사용합니다. 카카오톡은 폰과 PC 모두 이전 버전의 공식 스토어 이미지 `kakao-app.png`를 동일하게 사용합니다. PNG의 배경을 임계값으로 지우거나 아이콘 형태를 다시 그리지 않았습니다. 사용하지 않는 이전 시안은 출처 보관을 위해 남겨 두었습니다.

## 상품과 인물 사진 확장

추가한 상품 사진은 `headphones`, `sneakers`, `backpack`, `watch`, `mug`, `keyboard`, `lamp`, `mouse` 8장입니다. 인물 프사용 사진은 `profile-seoyeon`, `profile-park`, `profile-yujin` 3장입니다. 모두 Unsplash의 일반 무료 사진에서 내려받았으며 원본 주소는 `assets/sources.json`에 있습니다. 스톡 인물은 가상 연락처를 표현할 뿐 실제 인물의 이름·직업·관계나 추천을 뜻하지 않습니다. 사칭 계정에는 해당 인물 사진을 복제하지 않습니다.

카탈로그의 가격·상품 설명·평점·후기는 시뮬레이션용 예시이며 사진 속 실제 브랜드의 판매 정보가 아닙니다. 실제 결제·주문·배송 요청은 발생하지 않습니다.

두 말풍선 SVG 시안은 현재 화면에 사용하지 않습니다. 카카오톡의 활성 에셋 경로는 폰·PC 모두 `assets/brands/kakao-app.png`입니다.
