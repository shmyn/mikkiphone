/* 가상 인물·상품·사건으로 구성한 오프라인 시뮬레이션 데이터. 금액·후기는 예시입니다. */
(function(root){
  "use strict";
  var THREADS = {
  "pm_partner": {
    "app": "mail",
    "name": "이준호 (한빛상사)",
    "from": "jh.lee@hanbit-trade.example",
    "saved": true,
    "history": [
      {
        "when": "10월 29일",
        "subject": "RE: 11월 사무용품 발주 수량 확인",
        "text": "김하늘 담당자님, 안녕하세요.\n복사용지 50박스, 토너 10개, 의자 4개로 확인했습니다. 재고 확인해서 다음 주 초 견적서 보내드리겠습니다.\n감사합니다.\n이준호 과장 | 한빛상사 영업1팀"
      },
      {
        "when": "11월 3일",
        "subject": "RE: 배송 일정 문의",
        "text": "견적 확정 후 영업일 기준 2~3일 이내 출고 가능합니다. 세금계산서는 월말 일괄 발행으로 진행하겠습니다."
      }
    ],
    "asks": [
      {
        "label": "수정본 견적서도 보내셨나요?",
        "delays": [1000, 4400],
        "ifArrived": "P2",
        "verify": "ask_partner_p2",
        "then": [
          "잠시만요, 보낸 메일함 확인해 보겠습니다.",
          "오늘 발송한 건 처음 드린 PDF 한 건이고, 수정본 압축 파일은 저희 쪽에서 보낸 내역이 없네요. 해당 메일을 전달해 주실 수 있을까요?"
        ]
      },
      {
        "label": "회사 소개서도 메일로 부탁드려요",
        "verify": "ask_partner_p1",
        "then": [
          "네, 바로 보내드리겠습니다."
        ],
        "deliver": "Lp11"
      }
    ]
  },
  "pm_it": {
    "app": "mail",
    "name": "IT지원팀",
    "from": "it@company.example",
    "saved": true,
    "history": [
      {
        "when": "지난달",
        "subject": "사내 VPN 점검 안내",
        "text": "10월 28일 22시부터 2시간 동안 VPN 점검이 있습니다."
      }
    ]
  },
  "pm_hr": {
    "app": "mail",
    "name": "인사팀",
    "from": "hr@company.example",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "subject": "11월 필수 교육 일정",
        "text": "개인정보보호 교육을 11월 20일까지 이수해 주세요."
      }
    ]
  },
  "pm_moamall": {
    "app": "mail",
    "name": "쿠팡",
    "from": "order@coupang.example",
    "saved": true,
    "history": [
      {
        "when": "3일 전",
        "subject": "주문 확인: 무선 마우스",
        "text": "결제 금액 18,900원"
      }
    ]
  },
  "pm_letter": {
    "app": "mail",
    "name": "오후 한 페이지",
    "from": "letter@weekly.example",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "subject": "이번 주 업무 툴 소식",
        "text": "협업 툴 업데이트 정리"
      }
    ]
  },
  "pm_p2": {
    "app": "mail",
    "name": "이준호 (한빛상사)",
    "from": "jh.lee@hanbit-trade-mail.example",
    "saved": false,
    "history": []
  },
  "pm_p3": {
    "app": "mail",
    "name": "IT지원팀",
    "from": "it-helpdesk@company-support.example",
    "saved": false,
    "history": []
  },
  "pm_p6": {
    "app": "mail",
    "name": "쿠팡 고객센터",
    "from": "notice@coupang-care.example",
    "saved": false,
    "history": []
  },
  "pm_p7": {
    "app": "mail",
    "name": "박지훈 팀장",
    "from": "park.jihoon@freemail.example",
    "saved": false,
    "history": []
  },
  "pm_p8": {
    "app": "mail",
    "name": "인사팀 문서함",
    "from": "share@company-docs.example",
    "saved": false,
    "history": []
  },
  "pc_park": {
    "app": "chat",
    "name": "박지훈 팀장",
    "saved": true,
    "history": [
      {
        "when": "어제",
        "text": "오늘 자료 고마워요"
      },
      {
        "when": "어제",
        "me": true,
        "text": "넵 감사합니다!"
      }
    ],
    "asks": [
      {
        "label": "혹시 메일로 상품권 부탁하셨어요?",
        "delays": [1400, 3700],
        "ifArrived": "P7",
        "verify": "ask_park",
        "then": [
          "상품권이요? 저는 지금 거래처 미팅 와 있는데요.",
          "오전에 견적 건 말고 따로 요청한 건 없습니다. 그 메일 저한테 전달 한번 부탁해요."
        ]
      }
    ]
  },
  "pc_kim": {
    "app": "chat",
    "name": "김민수 대리",
    "saved": true,
    "history": [
      {
        "when": "11월 4일",
        "text": "하늘님 아까 말씀하신 견적 비교표 공유폴더에 올려뒀어요!"
      },
      {
        "when": "11월 4일",
        "me": true,
        "text": "확인했습니다 감사합니다!! 수량은 제가 다시 체크해볼게요"
      },
      {
        "when": "어제",
        "text": "내일 3시 회의실 2번으로 잡았어요. 자료는 출력 안 해도 된대요"
      },
      {
        "when": "어제",
        "me": true,
        "text": "넵 노트북만 가져갈게요 ㅎㅎ"
      }
    ]
  },
  "pc_jisu": {
    "app": "chat",
    "name": "지수",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "time": "오후 7:11",
        "text": "너 지난번에 찍은 산 사진 있냐"
      },
      {
        "when": "지난주",
        "time": "오후 7:12",
        "me": true,
        "text": "원본? 용량 개큰데ㅋㅋ"
      },
      {
        "when": "지난주",
        "time": "오후 7:13",
        "text": "ㅇㅇ 보내줘 내 폰엔 하늘만 나옴ㅋㅋ"
      },
      {
        "when": "어제",
        "time": "오후 9:03",
        "text": "주말에 또 갈래? 이번엔 짧은 코스로"
      },
      {
        "when": "어제",
        "time": "오후 9:10",
        "me": true,
        "text": "콜 근데 진짜 짧아야됨"
      }
    ],
    "asks": [
      {
        "label": "혹시 새 계정 만들었어?",
        "ifArrived": "P5",
        "verify": "ask_jisu",
        "then": [
          "계정? 나 새로 만든 거 없는데",
          "어디서 왔어? 아이디 보이게 캡처 좀 해봐"
        ]
      }
    ]
  },
  "pc_it": {
    "app": "chat",
    "name": "IT 헬프데스크",
    "saved": true,
    "history": [
      {
        "when": "지난달",
        "text": "문의 주시면 순서대로 답변드립니다."
      }
    ],
    "asks": [
      {
        "label": "보안 프로그램 설치하라는 메일이 왔는데요",
        "ifArrived": "P3",
        "then": [
          "메일 제목이랑 보낸 주소가 어떻게 되나요? 확인해 볼게요."
        ]
      },
      {
        "label": "PC가 감염됐다는 경고창이 떴어요",
        "ifArrived": "P4",
        "then": [
          "경고가 브라우저 페이지 안에 뜨는 건가요, 아니면 작업 표시줄 쪽에서 나온 건가요?"
        ]
      },
      {
        "label": "연봉 문서 열람 메일이 왔는데 정상인가요?",
        "ifArrived": "P8",
        "then": [
          "로그인하라는 화면 주소를 확인해 주실 수 있나요? 인사팀 배포 내역도 같이 볼게요."
        ]
      },
      {
        "label": "발신 주소가 it-helpdesk@company-support.example예요",
        "delays": [2100, 4900],
        "ifAsked": "pc_it:0",
        "ifArrived": "P3",
        "verify": "ask_it_p3",
        "then": [
          "확인했습니다. 오늘 저희 쪽에서 따로 설치 파일을 발송한 내역은 없네요.",
          "이번 주 업데이트는 기존 관리 프로그램으로 배포 중입니다. 보내주신 메일은 담당자가 확인해 보겠습니다."
        ]
      },
      {
        "label": "브라우저 안에 뜨고 전화하라고 나와요",
        "ifAsked": "pc_it:1",
        "ifArrived": "P4",
        "verify": "ask_it_p4",
        "then": [
          "말씀하신 형식은 사내 백신 알림과 다르네요.",
          "지금 열려 있는 페이지 주소를 남겨 주시고, 기존 백신 쪽에서도 같은 경고가 있는지 확인 부탁드립니다."
        ]
      },
      {
        "label": "주소가 company-docs.example로 떠요",
        "ifAsked": "pc_it:2",
        "ifArrived": "P8",
        "verify": "ask_it_p8",
        "then": [
          "내부 문서 공유 기록에는 그 주소의 발송 건이 없습니다.",
          "연봉 관련 문서는 인사팀 포털에서 배포 예정으로 되어 있네요. 인사팀에도 확인 요청 넣겠습니다."
        ]
      }
    ]
  },
  "pc_group": {
    "app": "chat",
    "name": "영업팀 공지방 (9)",
    "saved": true,
    "history": [
      {
        "when": "11월 4일",
        "text": "[박지훈] 11월 발주 일정표 최신본으로 업데이트했습니다. 변경사항 있으면 오늘 안에 알려주세요."
      },
      {
        "when": "11월 4일",
        "text": "[김민수] 확인했습니다!"
      },
      {
        "when": "어제",
        "text": "[박지훈] 금요일 회식은 회사 앞 고깃집, 18시 30분입니다. 못 오시는 분은 따로 말씀 주세요."
      }
    ]
  },
  "pc_p5": {
    "app": "chat",
    "name": "지수(새 계정)",
    "saved": false,
    "history": []
  },
  "pc_yuna": {
    "app": "chat",
    "name": "최유나 사원",
    "saved": true,
    "history": [
      {
        "when": "어제",
        "time": "오후 4:12",
        "text": "하늘님, 회의 자료에 들어갈 로고 원본 어디 있는지 아세요?"
      },
      {
        "when": "어제",
        "time": "오후 4:18",
        "me": true,
        "text": "공유폴더 브랜딩 안에 있어요! png 말고 svg 쓰시면 돼요"
      },
      {
        "when": "어제",
        "time": "오후 4:20",
        "text": "찾았어요 감사합니다 ㅠㅠ 계속 이미지 깨져서 헤매고 있었어요"
      }
    ],
    "asks": [
      {
        "label": "회의 자료는 잘 됐어요?",
        "then": [
          "네! 덕분에 안 깨지고 들어갔어요ㅎㅎ",
          "발표만 잘하면 될 것 같아요.."
        ]
      }
    ]
  }
};

  var ITEMS = [
  {
    "id": "Lp1",
    "kind": "legit",
    "at": 4,
    "title": "팀장 업무 메시지",
    "channel": "chat",
    "thread": "pc_park",
    "body": "견적서 메일 올 거예요. 받으면 검토하고 거래처에 회신 부탁해요.",
    "replies": [
      [
        {
          "label": "넵 알겠습니다",
          "effect": "handled"
        }
      ]
    ]
  },
  {
    "id": "Lp2",
    "kind": "legit",
    "at": 14,
    "title": "거래처 견적서 메일",
    "channel": "mail",
    "thread": "pm_partner",
    "subject": "11월 견적서 송부드립니다",
    "body": "요청하신 11월 견적서 첨부드립니다. 확인 부탁드립니다.",
    "attachments": [
      {
        "name": "견적서_11월.pdf",
        "type": "pdf",
        "taskStep": "quote_read"
      }
    ],
    "replies": [
      [
        {
          "label": "잘 받았습니다. 검토 후 회신드리겠습니다.",
          "effect": "handled",
          "taskStep": "quote_reply"
        }
      ]
    ]
  },
  {
    "id": "P2",
    "kind": "phish",
    "verified": true,
    "source": "기업 담당자 대상 압축 파일 속 바로가기 실행 스피어피싱(탐색 주간 보도)",
    "at": 28,
    "title": "견적서 수정본 압축 파일",
    "channel": "mail",
    "thread": "pm_p2",
    "subject": "[긴급] 견적서 수정본 재송부 - 오늘 중 확인 부탁",
    "body": "앞서 보낸 견적서에 단가 오류가 있어 수정본 보내드립니다. 오늘 중 확인 부탁드립니다. 보안상 압축 파일로 보냅니다.",
    "attachments": [
      {
        "name": "견적서_수정본.zip",
        "type": "zip",
        "inner": [
          {
            "name": "견적서_수정본.pdf.lnk",
            "type": "lnk"
          }
        ]
      }
    ],
    "weights": {
      "긴급": 1,
      "권위": 0.5
    },
    "verifyBy": [
      "ask_partner_p2"
    ],
    "redFlags": [
      "이름은 같지만 주소가 hanbit-trade-mail.example",
      "‘오늘 중’ 압박",
      "압축 파일 속 .pdf.lnk 바로가기"
    ]
  },
  {
    "id": "Ap1",
    "kind": "ambient",
    "at": 38,
    "channel": "mail",
    "thread": "pm_letter",
    "subject": "일요일에 읽고 싶은 다섯 페이지",
    "body": "이번 주말 가볍게 걸을 만한 길과 작은 독립서점들을 모았습니다. 짧은 에세이 한 편도 함께 보내드려요."
  },
  {
    "id": "Lp5",
    "kind": "legit",
    "at": 48,
    "title": "동료 점심 메시지",
    "channel": "chat",
    "thread": "pc_kim",
    "body": "오늘 점심 뭐 드실래요? 전 어제 파스타 먹어서 국밥이 좀 땡기긴 하는데ㅋㅋ",
    "replies": [
      [
        {
          "label": "국밥 가요",
          "effect": "handled",
          "then": [
            "좋아요 12시에 봬요"
          ]
        },
        {
          "label": "파스타 좋아요",
          "effect": "handled",
          "then": [
            "좋아요 12시에 봬요"
          ]
        }
      ]
    ]
  },
  {
    "id": "P6",
    "kind": "phish",
    "verified": true,
    "source": "KISA ‘개인정보 유출 보상금’ 미끼 경고",
    "at": 70,
    "title": "보상금 조회 프로그램 메일",
    "channel": "mail",
    "thread": "pm_p6",
    "subject": "[쿠팡] 개인정보 유출 보상금 조회 안내",
    "body": "고객님은 보상 대상 여부 확인이 필요합니다. 전용 조회 프로그램으로 바로 확인하세요. 3일 안에 조회하지 않으면 자동 소멸됩니다.",
    "link": {
      "text": "조회 프로그램 받기",
      "page": "pc_p6",
      "button": true
    },
    "weights": {
      "이득": 1,
      "긴급": 0.5
    },
    "verifyBy": [
      "moamall_notice_pc"
    ],
    "redFlags": [
      "쿠팡 주문 메일(moamall.example)과 다른 주소",
      "보상금과 ‘3일 안에’ 기한",
      "조회에 프로그램 설치 요구"
    ]
  },
  {
    "id": "Lp3",
    "kind": "legit",
    "at": 82,
    "title": "IT지원팀 보안 공지",
    "channel": "mail",
    "thread": "pm_it",
    "subject": "이번 주 보안 업데이트 자동 배포 안내",
    "body": "이번 주 보안 업데이트는 자동으로 배포됩니다. IT지원팀은 메일로 설치 파일을 보내지 않습니다.",
    "taskStep": "security_notice_read"
  },
  {
    "id": "P3",
    "kind": "phish",
    "verified": false,
    "at": 96,
    "title": "IT팀 사칭 설치 파일",
    "channel": "mail",
    "thread": "pm_p3",
    "subject": "[필수] 보안 점검 프로그램 설치 (오늘 18시까지)",
    "body": "전 직원 대상 보안 점검 프로그램을 오늘 18시까지 설치해 주세요. 설치하지 않으면 사내망 접속이 제한됩니다.",
    "attachments": [
      {
        "name": "보안점검_설치.exe",
        "type": "exe"
      }
    ],
    "weights": {
      "권위": 1,
      "긴급": 0.5
    },
    "verifyBy": [
      "ask_it_p3"
    ],
    "redFlags": [
      "IT지원팀 이름이지만 주소가 company-support.example",
      "미설치 시 접속 제한 위협",
      "메일에 첨부된 실행 파일(.exe)"
    ]
  },
  {
    "id": "Lp6",
    "kind": "legit",
    "at": 108,
    "title": "지수 주말 사진",
    "channel": "chat",
    "thread": "pc_jisu",
    "body": "주말 등산 사진 보낸다~",
    "photo": "여행 때 찍은 산",
    "photoSrc": "assets/photos/mountain.jpg",
    "replies": [
      [
        {
          "label": "와 잘 나왔다!",
          "effect": "handled",
          "then": [
            "ㅋㅋ 다음에 또 가자"
          ]
        }
      ]
    ]
  },
  {
    "id": "P5",
    "kind": "phish",
    "verified": false,
    "at": 122,
    "title": "지인 새 계정 사진 링크",
    "channel": "chat",
    "thread": "pc_p5",
    "body": "야 이거 너 아니야? ㅋㅋㅋ",
    "link": {
      "text": "photo-share.example/v/8812",
      "page": "pc_p5"
    },
    "weights": {
      "친밀": 1,
      "이득": 0.5
    },
    "verifyBy": [
      "ask_jisu"
    ],
    "redFlags": [
      "원래 지수 대화방이 아닌 새 계정",
      "호기심 자극",
      "사진 보기에 뷰어 설치 요구"
    ]
  },
  {
    "id": "Lp4",
    "kind": "legit",
    "at": 136,
    "title": "시스템 업데이트 알림",
    "channel": "toast",
    "source": "시스템",
    "body": "업데이트가 준비됐어요. 오늘 밤 자동으로 설치할까요?",
    "actions": [
      {
        "label": "오늘 밤 설치"
      },
      {
        "label": "나중에"
      }
    ]
  },
  {
    "id": "Ap2",
    "kind": "ambient",
    "at": 170,
    "channel": "chat",
    "thread": "pc_group",
    "body": "오늘 15시~16시 엘리베이터 점검 있습니다."
  },
  {
    "id": "P7",
    "kind": "phish",
    "verified": false,
    "at": 160,
    "title": "팀장 사칭 상품권 요청",
    "channel": "mail",
    "thread": "pm_p7",
    "subject": "부탁 하나만",
    "body": "회의 중이라 메일로 연락해요. 거래처 선물용으로 문화상품권 10만원권 5장 급하게 구매해서 핀번호 보내줄 수 있어요? 비용은 오후에 정산할게요.",
    "replies": [
      [
        {
          "label": "어떤 상품권이요?",
          "effect": "entered",
          "then": [
            "문화상품권 10만원권 5장이요. 급해요."
          ]
        }
      ],
      [
        {
          "label": "직접 확인하고 처리할게요",
          "effect": null,
          "then": [
            "지금 회의 중이라 통화 어려워요. 빨리요."
          ]
        },
        {
          "label": "구매해서 핀번호 보내드릴게요",
          "effect": "exposed",
          "then": [
            "고마워요. 최대한 빨리 부탁해요."
          ]
        }
      ]
    ],
    "weights": {
      "친밀": 1,
      "권위": 0.5
    },
    "verifyBy": [
      "ask_park"
    ],
    "redFlags": [
      "팀장 이름이지만 개인 메일(freemail.example)",
      "‘회의 중이라 통화가 안 된다’는 핑계",
      "상품권 핀번호 요구"
    ]
  },
  {
    "id": "Lp9",
    "kind": "legit",
    "at": 180,
    "title": "인사팀 연말정산 안내",
    "channel": "mail",
    "thread": "pm_hr",
    "subject": "연말정산 간소화 자료 제출 안내",
    "body": "사내 포털 인사 메뉴에서 12월 5일까지 제출해 주세요."
  },
  {
    "id": "P8",
    "kind": "phish",
    "verified": false,
    "at": 194,
    "title": "인사 문서 열람 로그인",
    "channel": "mail",
    "thread": "pm_p8",
    "subject": "2026 연봉 조정 결과 확인 (오늘까지 열람)",
    "body": "개인별 연봉 조정 결과 문서가 공유되었습니다. 회사 계정으로 로그인한 뒤 열람하세요.",
    "link": {
      "text": "문서 열기",
      "page": "pc_p8",
      "button": true
    },
    "weights": {
      "이득": 1,
      "권위": 0.5
    },
    "verifyBy": [
      "ask_it_p8"
    ],
    "redFlags": [
      "인사팀 이름이지만 company-docs.example",
      "‘오늘까지’ 기한",
      "외부 사이트에서 회사 계정 로그인 요구"
    ]
  },
  {
    "id": "Lp8",
    "kind": "legit",
    "at": 204,
    "title": "쿠팡 출고 메일",
    "channel": "mail",
    "thread": "pm_moamall",
    "subject": "주문하신 상품이 출고되었습니다",
    "body": "무선 마우스, 내일 도착 예정입니다."
  },
  {
    "id": "P4",
    "kind": "phish",
    "verified": false,
    "at": 216,
    "title": "가짜 감염 경고창",
    "channel": "popup",
    "popup": {
      "title": "시스템 보안 경고",
      "text": "이 PC에서 트로이 목마가 발견되었습니다. 개인정보가 유출되고 있습니다. 즉시 보안센터에 연락하세요.",
      "phone": "보안센터 1588-●●●●",
      "enter": "보안센터 연결",
      "next": "원격 지원 프로그램을 설치하면 상담원이 바로 치료해 드립니다.",
      "expose": "원격 지원 설치"
    },
    "weights": {
      "긴급": 1,
      "권위": 0.5
    },
    "verifyBy": [
      "ask_it_p4"
    ],
    "redFlags": [
      "브라우저 안에 뜬 ‘감염’ 경고",
      "즉시 전화 유도",
      "원격 지원 프로그램 설치 요구"
    ]
  },
  {
    "id": "Lp7",
    "kind": "legit",
    "at": 148,
    "title": "회의 일정 알림",
    "channel": "toast",
    "source": "캘린더",
    "body": "15:00 주간 회의 (10분 전) · 2번 회의실",
    "actions": [
      {
        "label": "확인"
      }
    ]
  },
  {
    "id": "P1",
    "kind": "phish",
    "verified": true,
    "source": "사용자가 직접 악성 명령어를 실행하게 만드는 수법(탐색 주간 보도)",
    "at": null,
    "title": "가짜 로봇 확인(명령어 실행)",
    "channel": "page",
    "weights": {
      "권위": 1,
      "긴급": 0.5
    },
    "verifyBy": [
      "ask_partner_p1"
    ],
    "redFlags": [
      "로봇 확인인데 명령어 실행을 요구",
      "Win+R과 붙여넣기 안내",
      "평소 쓰던 거래처 사이트에서 뜸(사이트 해킹)"
    ]
  },
  {
    "id": "Lp11",
    "kind": "legit",
    "at": null,
    "title": "거래처 회사 소개서 메일",
    "channel": "mail",
    "thread": "pm_partner",
    "subject": "회사 소개서 보내드립니다",
    "body": "요청하신 회사 소개서 첨부드립니다.",
    "attachments": [
      {
        "name": "한빛상사_회사소개서.pdf",
        "type": "pdf",
        "task": "t3"
      }
    ]
  },
  {
    "id": "Ap3",
    "kind": "ambient",
    "at": 58,
    "channel": "chat",
    "thread": "pc_yuna",
    "body": "하늘님 탕비실에 간식 들어왔대요. 나중에 오실 때 커피 한 잔 하실래요?",
    "replies": [
      [
        {
          "label": "좋아요 잠깐만 이것만 마무리하고 갈게요",
          "effect": "handled",
          "then": [
            "넵 전 먼저 가 있을게요!"
          ]
        }
      ]
    ]
  }
];

  var PAGES = {
  "pc_portal_login": {
    "url": "portal.company.example/login",
    "secure": true,
    "title": "회사 포털 로그인",
    "text": "회사 계정으로 로그인하세요.",
    "actions": [
      {
        "label": "회사 계정으로 로그인",
        "goto": "pc_portal_2fa"
      }
    ]
  },
  "pc_portal_2fa": {
    "url": "portal.company.example/verify",
    "secure": true,
    "title": "2단계 인증",
    "text": "휴대폰 인증 앱에서 로그인 요청을 승인하세요.",
    "actions": [
      {
        "label": "휴대폰에서 승인함",
        "goto": "pc_portal_home"
      }
    ]
  },
  "pc_portal_home": {
    "url": "portal.company.example",
    "secure": true,
    "title": "회사 포털",
    "text": "주요 업무와 사내 소식을 한눈에 확인하세요.",
    "actions": [
      {
        "label": "금요일 연차 신청",
        "goto": "pc_portal_done",
        "task": "t2"
      }
    ]
  },
  "pc_portal_done": {
    "url": "portal.company.example/leave",
    "secure": true,
    "title": "연차 신청 완료",
    "text": "11월 13일 금요일 연차 신청이 접수됐어요.",
    "actions": []
  },
  "pc_partner": {
    "url": "www.hanbit-trade.example",
    "secure": true,
    "title": "한빛상사",
    "text": "사무용품 유통 전문 · 2009년부터 함께한 비즈니스 파트너\n회사소개서 PDF · 2026년판 / 4MB\n다운로드가 어려우시면 영업 담당자에게 메일로 요청하실 수 있습니다.",
    "actions": [
      {
        "label": "회사 소개서 다운로드",
        "clickfix": true
      },
      {
        "label": "담당자에게 메일로 요청",
        "contact": "pm_partner"
      }
    ]
  },
  "pc_p6": {
    "url": "coupang-care.example/check",
    "title": "보상금 조회",
    "text": "아래 프로그램을 설치하면 보상 대상 여부를 바로 확인할 수 있습니다.",
    "actions": [
      {
        "label": "조회 프로그램 다운로드",
        "download": {
          "name": "보상금조회.exe",
          "type": "exe"
        }
      }
    ]
  },
  "pc_p5": {
    "url": "photo-share.example/v/8812",
    "title": "사진 보기",
    "text": "이 사진을 보려면 전용 뷰어를 설치해야 합니다.",
    "actions": [
      {
        "label": "뷰어 다운로드",
        "download": {
          "name": "PhotoViewer_setup.exe",
          "type": "exe"
        }
      }
    ]
  },
  "pc_p8": {
    "url": "company-docs.example/login",
    "title": "문서 열람 로그인",
    "text": "회사 계정으로 로그인하면 문서를 열람할 수 있습니다.",
    "actions": [
      {
        "label": "회사 계정으로 로그인",
        "effect": "exposed"
      }
    ]
  },
  "pc_moamall": {
    "url": "www.coupang.example",
    "secure": true,
    "title": "쿠팡",
    "text": "매일 필요한 상품을 둘러보세요.",
    "actions": []
  },
  "pc_news": {
    "url": "news.example",
    "secure": true,
    "title": "오늘의 뉴스",
    "text": "라이프 · 문화 · 오늘의 읽을거리",
    "actions": []
  },
  "pc_mall_notice": {
    "url": "www.coupang.example/notice",
    "secure": true,
    "title": "고객센터 안내",
    "text": "고객센터 공지사항",
    "actions": [],
    "verify": "moamall_notice_pc"
  }
};

  var BOOKMARKS = [
  {
    "name": "회사 포털",
    "page": "pc_portal_login"
  },
  {
    "name": "한빛상사",
    "page": "pc_partner"
  },
  {
    "name": "쿠팡",
    "page": "pc_moamall"
  },
  {
    "name": "뉴스",
    "page": "pc_news"
  }
];

  var FILES = {
  "문서": [
    {
      "name": "주간보고_11월2주.docx",
      "type": "doc"
    },
    {
      "name": "회의록_1105.hwp",
      "type": "doc"
    },
    {
      "name": "2026_예산안.xlsx",
      "type": "doc"
    }
  ],
  "사진": [
    {
      "name": "워크숍_단체사진.jpg",
      "type": "img",
      "src": "assets/photos/friends.jpg"
    },
    {
      "name": "프로젝트_회의.jpg",
      "type": "img",
      "src": "assets/photos/team.jpg"
    }
  ],
  "다운로드": [
    {
      "name": "11월_교육자료.pdf",
      "type": "pdf"
    }
  ]
};

  var DOCS = {
  "견적서_11월.pdf": {
    "title": "견 적 서",
    "meta": "한빛상사 → (주)우리회사 영업팀 · 2026.11.06",
    "lines": [
      "품목 | 수량 | 단가 | 금액",
      "A4 복사용지 | 50박스 | 24,000 | 1,200,000",
      "토너 카트리지 | 10개 | 68,000 | 680,000",
      "사무용 의자 | 4개 | 155,000 | 620,000",
      "합계 (부가세 별도) | | | 2,500,000",
      "유효기간: 발행일로부터 30일"
    ]
  },
  "한빛상사_회사소개서.pdf": {
    "title": "한빛상사 회사 소개",
    "meta": "2026년판",
    "lines": [
      "설립 2009년 · 사무용품 유통",
      "주요 거래처 120곳",
      "담당: 영업1팀 이준호 과장"
    ]
  },
  "11월_교육자료.pdf": {
    "title": "개인정보보호 교육",
    "meta": "인사팀 · 11월",
    "lines": [
      "1. 개인정보의 정의",
      "2. 메일 첨부파일 열기 전 확인할 것",
      "3. 사고 발생 시 보고 절차"
    ]
  },
  "주간보고_11월2주.docx": {
    "title": "주간 업무 보고",
    "meta": "영업팀 김하늘 · 11월 2주",
    "lines": [
      "한빛상사 11월 견적 수령 및 검토",
      "신규 거래처 2곳 미팅",
      "다음 주: 견적 회신, 연말 발주 계획"
    ]
  },
  "회의록_1105.hwp": {
    "title": "회의록",
    "meta": "11월 5일 주간 회의",
    "lines": [
      "참석: 박지훈 팀장, 김민수 대리, 김하늘",
      "연말 프로모션 일정 확정",
      "견적 회신 기한: 11월 7일"
    ]
  },
  "2026_예산안.xlsx": {
    "title": "2026 영업팀 예산안",
    "meta": "초안",
    "lines": [
      "항목 | 상반기 | 하반기",
      "출장비 | 4,000,000 | 4,500,000",
      "교육비 | 1,200,000 | 1,200,000"
    ]
  }
};

  var TASKS = [
  {
    "id": "t1",
    "text": "견적서 확인하고 거래처에 회신하기",
    "requires": [
      "quote_read",
      "quote_reply"
    ]
  },
  {
    "id": "t2",
    "text": "사내 포털에서 금요일 연차 신청하기"
  },
  {
    "id": "t3",
    "text": "한빛상사 회사 소개서 받기"
  },
  {
    "id": "t4",
    "text": "캘린더에서 주간 회의 장소 확인하기"
  },
  {
    "id": "t5",
    "text": "IT 공지 확인하고 오늘 밤 업데이트 예약하기",
    "requires": [
      "security_notice_read",
      "update_reserved"
    ]
  }
];

  var SESSION_END_SEC = 240;
  var EVENT_GAP_SEC = 10;

  function deepFreeze(o){ Object.getOwnPropertyNames(o).forEach(function(k){var v=o[k];if(v&&typeof v==="object")deepFreeze(v);});return Object.freeze(o); }
  var DATA = deepFreeze({THREADS:THREADS, ITEMS:ITEMS, PAGES:PAGES, BOOKMARKS:BOOKMARKS, FILES:FILES, DOCS:DOCS, TASKS:TASKS, SESSION_END_SEC:SESSION_END_SEC, EVENT_GAP_SEC:EVENT_GAP_SEC});
  if(typeof module!=="undefined" && module.exports)module.exports=DATA;else root.MK_PC=DATA;
})(this);
