/* 가상 인물·상품·사건으로 구성한 오프라인 시뮬레이션 데이터. 금액·후기는 예시입니다. */
(function(root){
  "use strict";
  var THREADS = {
  "hanbit": {
    "app": "messages",
    "name": "CJ대한통운",
    "number": "1588-●●●●",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "text": "[CJ대한통운] 고객님의 상품(책 2권)이 문 앞에 배송 완료되었습니다."
      }
    ]
  },
  "daon": {
    "app": "messages",
    "name": "토스뱅크",
    "number": "1588-●●●●",
    "saved": true,
    "history": [
      {
        "when": "어제",
        "text": "[토스뱅크] 토스 체크카드 승인 8,900원 · 카페"
      },
      {
        "when": "어제",
        "text": "[토스뱅크] 토스 체크카드 승인 32,000원 · 마트"
      }
    ]
  },
  "haneul": {
    "app": "messages",
    "name": "SK텔레콤",
    "number": "114",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "text": "[SK텔레콤] 10월 이용요금 55,000원이 청구되었습니다."
      }
    ]
  },
  "clinic": {
    "app": "messages",
    "name": "한빛의원",
    "number": "02-●●●-●●●●",
    "saved": true,
    "history": [
      {
        "when": "3일 전",
        "text": "[한빛의원] 11월 9일 오후 2시 진료 예약이 확인되었습니다."
      }
    ]
  },
  "moaad": {
    "app": "messages",
    "name": "쿠팡",
    "number": "1600-●●●●",
    "saved": false,
    "history": [
      {
        "when": "지난주",
        "text": "(광고)[쿠팡] 회원 전용 10% 쿠폰이 도착했어요.\n무료수신거부 080-●●●-●●●●"
      }
    ]
  },
  "auth_code": {
    "app": "messages",
    "name": "인증번호",
    "number": "1588-●●●●",
    "saved": true,
    "history": []
  },
  "t_s1": {
    "app": "messages",
    "name": "+63 9●●-●●●-4127",
    "saved": false,
    "history": []
  },
  "t_s2": {
    "app": "messages",
    "name": "070-●●●●-9055",
    "saved": false,
    "history": []
  },
  "t_s3": {
    "app": "messages",
    "name": "02-●●●-6612",
    "saved": false,
    "history": []
  },
  "t_s6": {
    "app": "messages",
    "name": "010-●●●●-2290",
    "saved": false,
    "history": []
  },
  "k_jisu": {
    "app": "talk",
    "name": "지수",
    "saved": true,
    "history": [
      {
        "when": "10월 29일",
        "text": "야 저번에 간 카페 이름 뭐였지?"
      },
      {
        "when": "10월 29일",
        "me": true,
        "text": "역 뒤에 온유! 라떼 맛있었던 데ㅋㅋ"
      },
      {
        "when": "10월 29일",
        "text": "맞다 고마워 ㅎㅎ"
      },
      {
        "when": "어제",
        "text": "우리 주말에 보기로 한 거 안 까먹었지?"
      },
      {
        "when": "어제",
        "me": true,
        "text": "당연하지ㅋㅋ 시간만 정하면 됨"
      }
    ]
  },
  "k_mom": {
    "app": "talk",
    "name": "엄마",
    "saved": true,
    "history": [
      {
        "when": "11월 3일",
        "text": "집에 반찬 좀 해놨는데 주말에 올 수 있어?"
      },
      {
        "when": "11월 3일",
        "me": true,
        "text": "토요일 저녁에 갈게!"
      },
      {
        "when": "어제",
        "text": "요새 춥다 목도리 하고 다녀"
      },
      {
        "when": "어제",
        "me": true,
        "text": "응 엄마도 감기 조심해ㅎㅎ"
      },
      {
        "when": "어제",
        "time": "오후 8:16",
        "text": "사진에 있는거 니꺼 맞지? 옷장 정리하다 나왔어"
      },
      {
        "when": "어제",
        "time": "오후 8:18",
        "me": true,
        "text": "응 그거 버리지마ㅋㅋ 갈 때 가져올게"
      },
      {
        "when": "어제",
        "time": "오후 8:20",
        "text": "알았어 따로 빼놓을게"
      }
    ]
  },
  "k_seoyeon": {
    "app": "talk",
    "name": "서연",
    "saved": true,
    "history": [
      {
        "when": "10월 22일",
        "time": "오후 7:08",
        "text": "혹시 그날 찍은 사진 원본 있어?? 내 폰엔 다 흔들렸어ㅋㅋ"
      },
      {
        "when": "10월 22일",
        "time": "오후 7:12",
        "me": true,
        "text": "나도 거의 다 흔들렸는데 일단 골라서 보내볼게"
      },
      {
        "when": "10월 22일",
        "time": "오후 7:13",
        "text": "웅 고마워 🥹"
      },
      {
        "when": "지난주",
        "time": "오후 9:31",
        "text": "다음에 밥 한번 먹자! 나 요즘 정신없어서 연락도 못했네"
      },
      {
        "when": "지난주",
        "time": "오후 9:36",
        "me": true,
        "text": "좋지ㅎㅎ 바쁜 거 끝나면 편한 날 말해줘"
      }
    ]
  },
  "k_park": {
    "app": "talk",
    "name": "박 팀장",
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
    ]
  },
  "k_group": {
    "app": "talk",
    "name": "대학 동기 (12)",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "sender": "민준",
        "time": "오후 3:41",
        "text": "모임 날짜 투표 좀 해줘요 여러분"
      },
      {
        "when": "지난주",
        "sender": "유진",
        "time": "오후 3:43",
        "text": "난 금요일 빼고 다 됨ㅠ"
      },
      {
        "when": "지난주",
        "me": true,
        "time": "오후 3:46",
        "text": "나도 평일은 애매해서 주말이 좋음"
      },
      {
        "when": "어제",
        "sender": "지수",
        "time": "오후 7:50",
        "text": "그럼 다음 주 금요일은? 이번 주 말고"
      },
      {
        "when": "어제",
        "sender": "유진",
        "time": "오후 7:53",
        "text": "아 다음 주는 됨ㅋㅋ 내가 잘못 봤다"
      }
    ]
  },
  "k_s5": {
    "app": "talk",
    "name": "엄마(새 번호)",
    "number": "010-●●●●-3392",
    "saved": false,
    "history": []
  },
  "m_haneul": {
    "app": "mail",
    "name": "SK텔레콤",
    "from": "billing@skt.example",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "subject": "10월 청구서",
        "text": "10월 이용요금 55,000원"
      }
    ]
  },
  "m_moamall": {
    "app": "mail",
    "name": "쿠팡",
    "from": "order@coupang.example",
    "saved": true,
    "history": [
      {
        "when": "3일 전",
        "subject": "주문 확인: 겨울 니트",
        "text": "결제 금액 39,000원"
      }
    ]
  },
  "m_letter": {
    "app": "mail",
    "name": "주간 뉴스레터",
    "from": "letter@weekly.example",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "subject": "이번 주 읽을거리 5",
        "text": "겨울 여행지 추천과 연말 정산 미리 보기"
      }
    ]
  },
  "m_nuri": {
    "app": "mail",
    "name": "무신사",
    "from": "order@musinsa.example",
    "saved": true,
    "history": []
  },
  "m_s7": {
    "app": "mail",
    "name": "무신사 보안팀",
    "from": "security@musinsa-notice.example",
    "saved": false,
    "history": []
  },
  "k_yujin": {
    "app": "talk",
    "name": "유진",
    "saved": true,
    "history": [
      {
        "when": "지난주",
        "time": "오후 11:03",
        "text": "야 너 지금 자??"
      },
      {
        "when": "지난주",
        "time": "오후 11:04",
        "me": true,
        "text": "아직 왜ㅋㅋ"
      },
      {
        "when": "지난주",
        "time": "오후 11:04",
        "text": "아니 방금 버스 반대로 탐ㅋㅋㅋㅋ 나 좀 살려"
      },
      {
        "when": "지난주",
        "time": "오후 11:05",
        "me": true,
        "text": "그걸 왜 나한테ㅋㅋㅋㅋ 일단 내려"
      },
      {
        "when": "어제",
        "time": "오후 6:22",
        "text": "이제 난 버스 타기 전에 종점부터 본다"
      },
      {
        "when": "어제",
        "time": "오후 6:23",
        "me": true,
        "text": "성장했네"
      }
    ],
    "asks": [
      {
        "label": "주말에 뭐함?",
        "then": [
          "나 토욜엔 본가 가! 일욜은 아마 집",
          "너는 지수 만난다 그랬나?"
        ]
      },
      {
        "label": "버스는 제대로 탔냐ㅋㅋ",
        "then": [
          "아ㅋㅋㅋㅋ 그만 놀려",
          "오늘은 멀쩡히 탔다 걱정 ㄴㄴ"
        ]
      }
    ]
  },
  "k_weekend": {
    "app": "talk",
    "name": "소소한 주말 (5)",
    "saved": true,
    "history": [
      {
        "when": "어제",
        "time": "오후 8:41",
        "sender": "유진",
        "text": "주말에 장 보러 갈 사람"
      },
      {
        "when": "어제",
        "time": "오후 8:43",
        "sender": "지수",
        "text": "나 식재료 사야됨"
      },
      {
        "when": "어제",
        "time": "오후 8:44",
        "me": true,
        "text": "또 한 봉지 사러 갔다가 네 봉지 사오는 모임 아니냐"
      },
      {
        "when": "어제",
        "time": "오후 8:45",
        "sender": "유진",
        "text": "그것도 추억이지"
      }
    ],
    "asks": [
      {
        "label": "나는 일요일 오후 가능",
        "then": [
          "유진: 오 그럼 점심 먹고 갈까?",
          "지수: 좋아 나 장바구니 챙겨감"
        ]
      }
    ]
  }
};

  var ITEMS = [
  {
    "id": "L2",
    "kind": "legit",
    "at": 0,
    "title": "쿠팡 배송 시작 알림",
    "channel": "push",
    "app": "moamall",
    "sender": "쿠팡",
    "body": "주문하신 겨울 니트가 발송되었어요. CJ대한통운으로 배송 중이며, 주문내역에서 자세한 상태를 확인할 수 있어요."
  },
  {
    "id": "L9",
    "quiet": true,
    "kind": "legit",
    "at": 7,
    "title": "CJ대한통운 배송 출발 문자",
    "channel": "sms",
    "thread": "hanbit",
    "body": "[CJ대한통운] 고객님의 상품(겨울 니트)이 배송 출발했습니다. 오늘 도착 예정입니다."
  },
  {
    "id": "s1",
    "kind": "phish",
    "verified": false,
    "at": 11,
    "title": "국제발신 택배 문자",
    "channel": "sms",
    "thread": "t_s1",
    "body": "[국제발신]\n[CJ대한통운] 고객님 택배가 주소 불명으로 보관 중입니다. 오늘 18시까지 주소를 수정하지 않으면 반송됩니다.",
    "link": {
      "text": "cj-delivery.example/kr",
      "page": "p_s1"
    },
    "weights": {
      "긴급": 1,
      "권위": 0.5
    },
    "verifyBy": [
      "moamall_orders",
      "call_hanbit"
    ],
    "redFlags": [
      "진짜 CJ대한통운 대화방이 아닌 국제발신 번호",
      "‘오늘 18시까지’라는 시간 압박",
      "주소 수정에 앱 설치를 요구"
    ]
  },
  {
    "id": "L1",
    "kind": "legit",
    "at": 88,
    "title": "지수 약속 메시지",
    "channel": "talk",
    "thread": "k_jisu",
    "body": "내일 몇 시에 봐? 나 6시 이후는 다 괜찮아",
    "replies": [
      [
        {
          "label": "7시 어때?",
          "effect": "handled",
          "then": [
            "ㅇㅋ 7시! 역 앞에서 봐"
          ],
          "task": "t1"
        },
        {
          "label": "8시 어때?",
          "effect": "handled",
          "then": [
            "좋아 8시!"
          ],
          "task": "t1"
        }
      ]
    ]
  },
  {
    "id": "A1",
    "kind": "ambient",
    "at": null,
    "channel": "sms",
    "thread": "moaad",
    "body": "(광고)[쿠팡] 겨울 아우터 최대 30% 할인, 이번 주 일요일까지\n무료수신거부 080-●●●-●●●●"
  },
  {
    "id": "s2",
    "kind": "phish",
    "verified": true,
    "source": "KISA ‘개인정보 유출 보상금’ 미끼 스미싱 경고",
    "at": 27,
    "title": "유출 보상금 문자",
    "channel": "sms",
    "thread": "t_s2",
    "body": "[Web발신]\n[쿠팡] 개인정보 유출 피해 보상금 안내\n고객님은 보상 대상자로 확인되었습니다. 보상금 최대 30만 원. 3일 안에 신청하지 않으면 자동 소멸됩니다.",
    "link": {
      "text": "coupang-care.example",
      "page": "p_s2"
    },
    "weights": {
      "이득": 1,
      "긴급": 0.5
    },
    "verifyBy": [
      "moamall_notice",
      "search_moamall"
    ],
    "redFlags": [
      "070 번호에서 온 ‘쿠팡’ 문자",
      "보상액과 ‘3일 안에’ 기한 제시",
      "공식 앱 공지가 아닌 문자 링크"
    ]
  },
  {
    "id": "L5",
    "kind": "legit",
    "at": 18,
    "title": "엄마 전화",
    "channel": "call",
    "caller": "엄마",
    "saved": true,
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "여보세요, 밥은 먹었어?"
          ],
          "choices": [
            {
              "label": "응 먹었어",
              "to": "b"
            },
            {
              "label": "아직, 이따 먹으려고",
              "to": "b"
            }
          ]
        },
        "b": {
          "say": [
            "주말에 집에 올 거지? 반찬 해놨어."
          ],
          "choices": [
            {
              "label": "응, 갈게",
              "to": "c",
              "task": "t5"
            },
            {
              "label": "이번 주는 좀 바빠",
              "to": "d",
              "task": "t5"
            }
          ]
        },
        "c": {
          "say": [
            "그래, 조심히 와."
          ],
          "end": true
        },
        "d": {
          "say": [
            "알았어, 바쁘면 다음 주에 와."
          ],
          "end": true
        }
      }
    }
  },
  {
    "id": "A2",
    "kind": "ambient",
    "at": 50,
    "channel": "talk",
    "thread": "k_group",
    "body": "금요일 7시 강남역 어때?",
    "sender": "민준",
    "replies": [
      [
        {
          "label": "금요일 7시 강남역 좋아!",
          "effect": "handled",
          "task": "t6",
          "then": [
            "좋아, 그럼 내가 근처로 예약할게!"
          ]
        }
      ]
    ]
  },
  {
    "id": "s5",
    "kind": "phish",
    "verified": false,
    "at": 43,
    "title": "가족 사칭 메신저",
    "channel": "talk",
    "thread": "k_s5",
    "body": "엄마야. 폰 액정이 깨져서 수리 맡기고 임시폰으로 연락해. 급하게 인증할 게 있는데 좀 도와줄래?",
    "replies": [
      [
        {
          "label": "응 뭔데?",
          "effect": "entered",
          "then": [
            "방금 네 폰으로 문자 온 인증번호 6자리 보내줘. 엄마 지금 급해."
          ],
          "deliver": "A5"
        }
      ],
      [
        {
          "label": "엄마 맞아? 전화해볼게",
          "effect": null,
          "then": [
            "지금 전화 안 돼. 빨리 보내줘!"
          ]
        },
        {
          "label": "인증번호 보내기",
          "ifArrived": "A5",
          "effect": "exposed",
          "then": [
            "고마워~ 엄마가 나중에 전화할게"
          ]
        }
      ]
    ],
    "weights": {
      "친밀": 1,
      "긴급": 0.5
    },
    "verifyBy": [
      "call_mom"
    ],
    "redFlags": [
      "원래 ‘엄마’ 대화방이 아닌 새 번호",
      "‘급해’라는 압박",
      "인증번호 요구"
    ]
  },
  {
    "id": "L6",
    "kind": "legit",
    "at": 70,
    "title": "서연 청첩장",
    "channel": "talk",
    "thread": "k_seoyeon",
    "body": "나 12월 12일에 결혼해! 모바일 청첩장 보낼게 :)",
    "link": {
      "text": "seoyeon-minjun.example",
      "page": "p_L6"
    },
    "replies": [
      [
        {
          "label": "축하해!!",
          "effect": "handled",
          "then": [
            "고마워 꼭 와 ㅎㅎ"
          ]
        }
      ]
    ]
  },
  {
    "id": "s6",
    "kind": "phish",
    "verified": false,
    "at": 79,
    "title": "모바일 청첩장 문자",
    "channel": "sms",
    "thread": "t_s6",
    "body": "[Web발신]\n김민준♥이서연 결혼합니다. 바쁘시더라도 오셔서 축하해 주세요. 모바일 청첩장 보기",
    "link": {
      "text": "wedding-card.example/mj",
      "page": "p_s6"
    },
    "weights": {
      "친밀": 1,
      "이득": 0.5
    },
    "verifyBy": [
      "call_seoyeon"
    ],
    "redFlags": [
      "서연은 청첩장을 카카오톡로 이미 보냄",
      "저장되지 않은 번호",
      "청첩장 보기에 앱 설치 요구"
    ]
  },
  {
    "id": "s4",
    "kind": "phish",
    "verified": true,
    "source": "계좌 보호 명목 원격제어 앱 설치 요구 수법(경찰 안내)",
    "at": 119,
    "title": "수사기관 사칭 전화",
    "channel": "call",
    "caller": "02-●●●-1130",
    "saved": false,
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "○○지방검찰청 수사관입니다. 고객님 명의 계좌가 금융범죄에 연루되어 확인이 필요합니다."
          ],
          "choices": [
            {
              "label": "네? 무슨 일인데요?",
              "to": "b"
            },
            {
              "label": "검찰이 전화로요? 확인하고 다시 걸게요",
              "to": "x"
            }
          ]
        },
        "b": {
          "say": [
            "수사 보안상 이 통화는 가족에게도 말씀하시면 안 됩니다.",
            "자산 보호를 위해 지금 문자로 보내드리는 ‘보안 점검’ 앱을 설치해 주세요."
          ],
          "choices": [
            {
              "label": "알겠습니다, 설치할게요",
              "to": "y",
              "effect": "exposed"
            },
            {
              "label": "끊고 직접 확인해볼게요",
              "to": "x"
            }
          ]
        },
        "x": {
          "say": [
            "지금 끊으시면 계좌가 동결될 수 있습니다. 바로 진행하셔야 합니다."
          ],
          "choices": [
            {
              "label": "알겠어요, 설치할게요",
              "to": "y",
              "effect": "exposed"
            }
          ]
        },
        "y": {
          "say": [
            "네, 설치되면 원격으로 점검하겠습니다."
          ],
          "end": true
        }
      }
    },
    "weights": {
      "권위": 1,
      "긴급": 0.5
    },
    "verifyBy": [
      "call_police"
    ],
    "redFlags": [
      "수사기관을 내세운 권위",
      "‘가족에게도 말하지 말라’는 고립 시도",
      "끊으려 하자 ‘계좌 동결’ 압박",
      "통화 중 앱 설치 요구"
    ]
  },
  {
    "id": "A3",
    "kind": "ambient",
    "at": null,
    "channel": "talk",
    "thread": "k_group",
    "body": "ㅇㅇ 좋아 내가 예약할게",
    "sender": "유진"
  },
  {
    "id": "L7",
    "quiet": true,
    "kind": "legit",
    "at": 92,
    "title": "무신사 주문 메일",
    "channel": "mail",
    "thread": "m_nuri",
    "subject": "주문이 완료되었습니다",
    "body": "주문번호 2611-0731. 결제 금액 23,000원. 배송이 시작되면 다시 알려드릴게요."
  },
  {
    "id": "s7",
    "kind": "phish",
    "verified": true,
    "source": "11/2 일본 노지마 유출 후 비밀번호 강제 초기화 사례 변형",
    "at": 97,
    "title": "비밀번호 초기화 메일",
    "channel": "mail",
    "thread": "m_s7",
    "subject": "[중요] 보안 정책에 따른 비밀번호 강제 초기화 안내",
    "body": "최근 외부 해킹 시도가 확인되어 모든 회원의 비밀번호를 초기화했습니다. 24시간 안에 본인 확인을 마치지 않으면 계정이 잠깁니다.",
    "link": {
      "text": "본인 확인하기",
      "page": "p_s7",
      "button": true
    },
    "weights": {
      "권위": 1,
      "긴급": 0.5
    },
    "verifyBy": [
      "search_nuri"
    ],
    "redFlags": [
      "‘보안팀’이라는 권위",
      "‘24시간 안에’ 기한",
      "주문 메일(musinsa.example)과 다른 발신 주소"
    ]
  },
  {
    "id": "A4",
    "kind": "ambient",
    "at": null,
    "channel": "call",
    "caller": "070-●●●●-8812",
    "saved": false,
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "안녕하세요, SK텔레콤 인터넷 결합 상품 안내드리려고 연락드렸습니다."
          ],
          "choices": [
            {
              "label": "관심 없어요",
              "to": "b"
            },
            {
              "label": "나중에 다시 연락 주세요",
              "to": "b"
            }
          ]
        },
        "b": {
          "say": [
            "네, 알겠습니다. 좋은 하루 되세요."
          ],
          "end": true
        }
      }
    }
  },
  {
    "id": "s3",
    "kind": "phish",
    "verified": true,
    "source": "금융사 사칭 금리·한도 조정 제안(경찰 주의보)",
    "at": 141,
    "title": "저금리 대출 문자",
    "channel": "sms",
    "thread": "t_s3",
    "body": "[Web발신]\n[토스뱅크] 정부지원 저금리 대환대출 안내\n고객님은 연 3.9% 고정금리 승인 대상입니다. 한도를 조회해 보세요.",
    "link": {
      "text": "toss-loan.example",
      "page": "p_s3"
    },
    "weights": {
      "이득": 1,
      "권위": 0.5
    },
    "verifyBy": [
      "bank_notice",
      "call_bank_loan"
    ],
    "redFlags": [
      "진짜 토스뱅크 대화방이 아닌 02 번호",
      "‘정부지원’이라는 권위",
      "상담에 원격 지원 앱 설치 요구"
    ]
  },
  {
    "id": "L10",
    "kind": "legit",
    "at": 103,
    "title": "택배 기사 전화(010)",
    "channel": "call",
    "caller": "010-●●●●-5521",
    "saved": false,
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "안녕하세요, CJ대한통운 기사입니다. 겨울 니트 왔는데 집에 안 계셔서요.",
            "문 앞에 둘까요, 경비실에 맡길까요?"
          ],
          "choices": [
            {
              "label": "문 앞에 두세요",
              "to": "b",
              "deliveryPlace": "door"
            },
            {
              "label": "경비실에 맡겨 주세요",
              "to": "b",
              "deliveryPlace": "guard"
            }
          ]
        },
        "b": {
          "say": [
            "네, 그렇게 해드릴게요. 수고하세요."
          ],
          "end": true
        }
      }
    }
  },
  {
    "id": "L3",
    "quiet": true,
    "kind": "legit",
    "at": 131,
    "title": "CJ대한통운 배송 완료 문자",
    "channel": "sms",
    "thread": "hanbit",
    "body": "[CJ대한통운] 고객님의 상품(겨울 니트)이 문 앞에 배송 완료되었습니다."
  },
  {
    "id": "L8",
    "kind": "legit",
    "at": 55,
    "title": "토스 체크카드 결제 문자",
    "channel": "sms",
    "thread": "daon",
    "body": "[토스뱅크] 토스 체크카드 승인 12,000원 · 편의점"
  },
  {
    "id": "s8",
    "kind": "phish",
    "verified": true,
    "source": "KISA 검색 상단 광고 악용 피싱 사이트 수법",
    "at": 61,
    "title": "분실 신고 검색 광고",
    "channel": "task",
    "body": "어? 방금 모르는 결제 문자가 왔는데 지갑이 없다. 카드 분실 신고부터 하자.",
    "weights": {
      "긴급": 1,
      "권위": 0.5
    },
    "verifyBy": [
      "search_daon_official",
      "bank_lost",
      "call_bank_lost"
    ],
    "redFlags": [
      "검색 결과 맨 위의 ‘광고’",
      "공식 주소(tossbank.example)와 다른 도메인",
      "급한 상황에서 첫 결과를 누르게 됨"
    ]
  },
  {
    "id": "A5",
    "kind": "ambient",
    "at": null,
    "channel": "sms",
    "thread": "auth_code",
    "body": "[본인확인] 인증번호 [482913]. 본인이 요청하지 않았다면 타인에게 번호를 알려주지 마세요."
  },
  {
    "id": "L4",
    "kind": "legit",
    "at": null,
    "title": "토스뱅크 인증번호 문자",
    "channel": "sms",
    "thread": "daon",
    "body": "[토스뱅크] 인증번호 [583021]를 입력해 주세요. 타인에게 알려주지 마세요."
  },
  {
    "id": "A6",
    "kind": "ambient",
    "at": null,
    "channel": "talk",
    "thread": "k_yujin",
    "body": "점심 먹었냐 나 메뉴 고르다가 점심시간 끝나게 생김",
    "replies": [
      [
        {
          "label": "ㅋㅋ 난 벌써 먹음",
          "effect": "handled",
          "then": [
            "배신자.. 나 그냥 김밥 시킨다"
          ]
        },
        {
          "label": "그냥 맨날 먹는 거 먹어",
          "effect": "handled",
          "then": [
            "정답이다 오늘도 김치찌개"
          ]
        }
      ]
    ]
  },
  {
    "id": "A7",
    "kind": "ambient",
    "at": null,
    "channel": "talk",
    "thread": "k_weekend",
    "body": "이거 누가 우리 단톡 이름 바꿨냐ㅋㅋㅋ",
    "sender": "지수"
  },
  {
    "id": "A8",
    "kind": "ambient",
    "at": null,
    "channel": "talk",
    "thread": "k_yujin",
    "body": "아 맞다 지난번에 빌린 우산 다음에 줄게. 현관에 놔뒀다"
  }
];

  var PAGES = {
  "p_s1": {
    "url": "cj-delivery.example/kr",
    "title": "주소 확인",
    "text": "주소 수정을 위해 ‘배송조회’ 앱 설치가 필요합니다.",
    "actions": [
      {
        "label": "앱 설치",
        "effect": "exposed"
      }
    ]
  },
  "p_s2": {
    "url": "coupang-care.example/claim",
    "title": "보상금 신청",
    "text": "보상금 지급을 위해 본인 확인이 필요합니다. 등록된 계좌·카드 정보로 확인해 주세요.",
    "actions": [
      {
        "label": "계좌·카드 정보로 본인 확인",
        "effect": "exposed"
      }
    ]
  },
  "p_s3": {
    "url": "toss-loan.example/consult",
    "title": "대출 상담",
    "text": "상담원 연결을 위해 ‘보안 상담’ 앱(원격 지원)을 설치해 주세요.",
    "actions": [
      {
        "label": "상담 앱 설치",
        "effect": "exposed"
      }
    ]
  },
  "p_s6": {
    "url": "wedding-card.example/mj",
    "title": "모바일 청첩장",
    "text": "청첩장을 보려면 ‘모바일 초대장’ 앱 설치가 필요합니다.",
    "actions": [
      {
        "label": "앱 설치",
        "effect": "exposed"
      }
    ]
  },
  "p_s7": {
    "url": "musinsa-notice.example/login",
    "title": "무신사 본인 확인",
    "text": "기존 비밀번호로 로그인한 뒤 새 비밀번호를 설정하세요.",
    "actions": [
      {
        "label": "기존 비밀번호로 로그인",
        "effect": "exposed"
      }
    ]
  },
  "p_s8": {
    "url": "toss-card24.example",
    "title": "분실 신고 센터",
    "text": "분실 신고 전용 상담 1588-●●●●. 지금 전화하시면 즉시 정지해 드립니다.",
    "actions": [
      {
        "label": "이 번호로 전화",
        "effect": "exposed"
      }
    ]
  },
  "p_s8_official": {
    "url": "www.tossbank.example/lost",
    "title": "토스 체크카드 분실 신고",
    "text": "분실 신고는 토스뱅크 앱의 ‘카드 분실신고’ 메뉴나 고객센터 전화로 할 수 있어요.",
    "actions": [],
    "verify": "search_daon_official"
  },
  "p_L6": {
    "url": "seoyeon-minjun.example",
    "title": "서연 ♥ 민준",
    "text": "12월 12일 토요일 오후 1시, 한빛웨딩홀 3층. 와주시면 큰 기쁨이 되겠습니다.",
    "actions": []
  },
  "p_nuri": {
    "url": "www.musinsa.example/notice",
    "title": "무신사 공지",
    "text": "최근 무신사를 사칭한 ‘비밀번호 강제 초기화’ 메일이 돌고 있어요. 무신사는 메일 링크로 기존 비밀번호를 요구하지 않습니다.",
    "actions": [],
    "verify": "search_nuri"
  },
  "p_moamall_web": {
    "url": "www.coupang.example/notice",
    "title": "쿠팡 공지",
    "text": "개인정보 유출 관련 보상 안내는 쿠팡 앱 공지로만 드리며, 문자 링크로 신청을 받지 않습니다.",
    "actions": [],
    "verify": "search_moamall"
  },
  "p_weather": {
    "url": "weather.example",
    "title": "내일 날씨",
    "text": "맑음, 최저 2도 최고 11도. 저녁에 쌀쌀해요.",
    "actions": []
  },
  "p_news": {
    "url": "news.example",
    "title": "오늘의 주요 뉴스",
    "text": "증시 급락에 개인투자자 불안 커져… 해킹·개인정보 유출 사고 잇따라",
    "actions": []
  }
};

  var SEARCHES = [
  {
    "q": "내일 날씨",
    "results": [
      {
        "title": "내일 날씨",
        "url": "weather.example",
        "page": "p_weather"
      }
    ]
  },
  {
    "q": "오늘 뉴스",
    "results": [
      {
        "title": "오늘의 주요 뉴스",
        "url": "news.example",
        "page": "p_news"
      }
    ]
  },
  {
    "q": "토스 체크카드 분실신고",
    "results": [
      {
        "ad": true,
        "title": "토스 체크카드 분실신고 24시 즉시 처리",
        "url": "toss-card24.example",
        "page": "p_s8",
        "phish": "s8"
      },
      {
        "title": "토스 체크카드 공식 홈페이지 - 분실 신고",
        "url": "www.tossbank.example",
        "page": "p_s8_official"
      }
    ]
  },
  {
    "q": "무신사 공지",
    "results": [
      {
        "title": "무신사 공지사항",
        "url": "www.musinsa.example",
        "page": "p_nuri"
      }
    ]
  },
  {
    "q": "쿠팡 보상금",
    "results": [
      {
        "title": "쿠팡 공지사항",
        "url": "www.coupang.example",
        "page": "p_moamall_web"
      }
    ]
  }
];

  var CONTACTS = [
  {
    "key": "mom",
    "name": "엄마",
    "number": "010-●●●●-1004",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "응 왜~"
          ],
          "choices": [
            {
              "label": "그냥 안부 전화했어",
              "to": "p"
            },
            {
              "label": "주말에 반찬 가지러 갈게",
              "to": "w",
              "task": "t5"
            },
            {
              "label": "엄마, 다른 번호로 카톡 보냈어?",
              "ifArrived": "s5",
              "ifOpened": "s5",
              "to": "s",
              "verify": "call_mom"
            }
          ]
        },
        "p": {
          "say": [
            "싱겁긴. 밥 잘 챙겨 먹어."
          ],
          "end": true
        },
        "w": {
          "say": [
            "그래, 김치도 담가놨어. 조심히 와."
          ],
          "end": true
        },
        "s": {
          "say": [
            "새 번호? 나 번호 안 바꿨는데. 지금도 내 폰으로 받는 거잖아.",
            "무슨 인증을 해달래? 나 지금 마트라서 그런 거 보낸 적 없는데."
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "dad",
    "name": "아빠",
    "number": "010-●●●●-7788",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "어, 왜?"
          ],
          "choices": [
            {
              "label": "그냥 걸었어요",
              "to": "p"
            },
            {
              "label": "주말에 집에 갈게요",
              "to": "q"
            }
          ]
        },
        "p": {
          "say": [
            "어 그래. 오늘은 좀 일찍 끝났냐?",
            "아빠는 이제 밥 먹으러 간다. 너도 잘 챙겨 먹고."
          ],
          "end": true
        },
        "q": {
          "say": [
            "그래, 엄마한테도 말해놓으마."
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "jisu",
    "name": "지수",
    "number": "010-●●●●-2580",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "어, 왜. 나 지금 밖이라 좀 시끄러울 수 있음ㅋㅋ"
          ],
          "choices": [
            {
              "label": "응 맞아, 내일 봐",
              "to": "p"
            },
            {
              "label": "내일 비 온대, 우산 챙겨",
              "to": "q"
            }
          ]
        },
        "p": {
          "say": [
            "ㅇㅋ 내일 봐!"
          ],
          "end": true
        },
        "q": {
          "say": [
            "아 진짜? 나 우산 회사에 두고 왔는데",
            "편의점 들러야겠네 고마워ㅋㅋ"
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "seoyeon",
    "name": "서연",
    "number": "010-●●●●-1212",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "응! 무슨 일이야?"
          ],
          "choices": [
            {
              "label": "결혼 축하해!",
              "ifArrived": "L6",
              "ifOpened": "L6",
              "to": "p"
            },
            {
              "label": "주말에 시간 괜찮아?",
              "to": "q"
            },
            {
              "label": "혹시 청첩장 문자로도 보냈어?",
              "ifArrived": "s6",
              "ifOpened": "s6",
              "to": "s",
              "verify": "call_seoyeon"
            }
          ]
        },
        "p": {
          "say": [
            "고마워 꼭 와!"
          ],
          "end": true
        },
        "q": {
          "say": [
            "이번 주는 좀 바빠서 다음 주에 보자!"
          ],
          "end": true
        },
        "s": {
          "say": [
            "문자는 따로 안 보냈어. 단톡이랑 개인 카톡에만 보냈는데?",
            "어떤 번호로 왔는데? 캡처해서 보내줘봐. 식장 쪽에서 보낸 건지 나도 한번 볼게."
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "park",
    "name": "박 팀장",
    "number": "010-●●●●-4410",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "네, 무슨 일이에요?"
          ],
          "choices": [
            {
              "label": "내일 회의 자료 오늘 보내드릴게요",
              "to": "p"
            },
            {
              "label": "금요일 반차 써도 될까요?",
              "to": "q"
            }
          ]
        },
        "p": {
          "say": [
            "좋아요, 고마워요."
          ],
          "end": true
        },
        "q": {
          "say": [
            "네, 결재 올려 두세요."
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "clinic",
    "name": "한빛의원",
    "number": "02-●●●-●●●●",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "네, 한빛의원입니다."
          ],
          "choices": [
            {
              "label": "9일 진료 예약 확인하려고요",
              "to": "p"
            },
            {
              "label": "예약 시간 바꿀 수 있을까요?",
              "to": "q"
            }
          ]
        },
        "p": {
          "say": [
            "네, 11월 9일 오후 2시로 잡혀 있어요."
          ],
          "end": true
        },
        "q": {
          "say": [
            "11월 9일 오후 4시로 바꿔 드릴게요."
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "chicken",
    "name": "동네 치킨",
    "number": "02-●●●-●●●●",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "네, 동네 치킨입니다. 주문 도와드릴까요?"
          ],
          "choices": [
            {
              "label": "후라이드 한 마리요",
              "to": "p"
            },
            {
              "label": "양념 반 후라이드 반이요",
              "to": "p"
            }
          ]
        },
        "p": {
          "say": [
            "네, 40분 정도 걸려요. 주소는 지난번이랑 같죠?"
          ],
          "choices": [
            {
              "label": "네, 같아요",
              "to": "q"
            }
          ]
        },
        "q": {
          "say": [
            "감사합니다. 맛있게 드세요!"
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "haneul",
    "name": "SK텔레콤 고객센터",
    "number": "114",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "SK텔레콤입니다. 무엇을 도와드릴까요?"
          ],
          "choices": [
            {
              "label": "이번 달 요금 문의요",
              "to": "p"
            },
            {
              "label": "요금제 바꾸고 싶어요",
              "to": "q"
            }
          ]
        },
        "p": {
          "say": [
            "이번 달 청구 예정 금액은 55,000원입니다."
          ],
          "end": true
        },
        "q": {
          "say": [
            "앱의 요금제 메뉴에서 바로 변경하실 수 있어요."
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "hanbit",
    "name": "CJ대한통운 고객센터",
    "number": "1588-●●●●",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "CJ대한통운입니다. 무엇을 도와드릴까요?"
          ],
          "choices": [
            {
              "label": "배송 조회하려고요",
              "to": "p"
            },
            {
              "label": "주소 수정하라는 문자를 받았는데요",
              "ifArrived": "s1",
              "ifOpened": "s1",
              "to": "s",
              "verify": "call_hanbit"
            }
          ]
        },
        "p": {
          "say": [
            "겨울 니트, 오늘 배송 예정입니다."
          ],
          "end": true
        },
        "s": {
          "say": [
            "잠시만요, 배송 상태 확인해 볼게요.",
            "고객님 상품은 기존 주소로 정상 배송 중이고 주소 변경 접수 내역은 없습니다. 안내받은 번호를 확인해 주시겠어요?"
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "bank",
    "name": "토스뱅크 고객센터",
    "number": "1588-●●●●",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "토스뱅크입니다. 무엇을 도와드릴까요?"
          ],
          "choices": [
            {
              "label": "잔액 문의요",
              "to": "p"
            },
            {
              "label": "대출 안내 문자를 받았는데요",
              "ifArrived": "s3",
              "ifOpened": "s3",
              "to": "loan",
              "verify": "call_bank_loan"
            },
            {
              "label": "카드를 잃어버렸어요",
              "ifArrived": "s8",
              "to": "lost",
              "verify": "call_bank_lost",
              "task": "t4"
            }
          ]
        },
        "p": {
          "say": [
            "앱에서 바로 확인하실 수 있어요."
          ],
          "end": true
        },
        "loan": {
          "say": [
            "안내받으신 금리나 상품명이 따로 있을까요?",
            "현재 고객님 앞으로 문자 발송된 대출 승인 건은 조회되지 않네요. 발신번호와 문자 내용을 확인해 봐야 할 것 같습니다."
          ],
          "end": true
        },
        "lost": {
          "say": [
            "분실 신고가 접수되어 카드 사용을 정지했습니다."
          ],
          "end": true
        }
      }
    }
  },
  {
    "key": "police",
    "name": "경찰청",
    "number": "112",
    "dialog": {
      "start": "a",
      "nodes": {
        "a": {
          "say": [
            "112입니다. 무슨 일이세요?"
          ],
          "choices": [
            {
              "label": "아, 잘못 걸었어요",
              "to": "p"
            },
            {
              "label": "검찰이라며 앱을 깔라는 전화를 받았어요",
              "ifArrived": "s4",
              "to": "s",
              "verify": "call_police"
            }
          ]
        },
        "p": {
          "say": [
            "네, 끊겠습니다."
          ],
          "end": true
        },
        "s": {
          "say": [
            "네, 어떤 내용으로 연락을 받으셨나요? 계좌나 앱 설치 얘기를 하셨다는 거죠?",
            "통화 내용과 발신번호를 남겨 두시고, 실제로 설치하거나 송금한 내역이 있는지도 확인 부탁드립니다."
          ],
          "end": true
        }
      }
    }
  }
];

  var CALL_HISTORY = [
  {
    "name": "엄마",
    "label": "어제 · 받음"
  },
  {
    "name": "한빛의원",
    "label": "3일 전 · 발신"
  },
  {
    "name": "박 팀장",
    "label": "지난주 · 받음"
  },
  {
    "name": "동네 치킨",
    "label": "지난주 · 발신"
  },
  {
    "name": "1600-●●●●",
    "label": "지난주 · 부재중"
  },
  {
    "name": "아빠",
    "label": "지난주 · 받음"
  }
];

  var TASKS = [
  {
    "id": "t2",
    "text": "쿠팡 니트 배송 확인"
  },
  {
    "id": "t3",
    "text": "토스 이번 달 카드값 확인"
  },
  {
    "id": "t5",
    "text": "엄마와 주말 일정 정하기"
  },
  {
    "id": "t6",
    "text": "단톡방 모임 장소 답장",
    "waitsFor": "A2"
  },
  {
    "id": "t4",
    "text": "토스 체크카드 분실 신고",
    "appearsWith": "s8"
  },
  {
    "id": "t1",
    "text": "지수와 내일 약속 정하기",
    "waitsFor": "L1"
  }
];

  var PHOTOS = [
  {
    "name": "바닷가 산책",
    "src": "assets/photos/sea.jpg",
    "tone": "sea"
  },
  {
    "name": "고양이 발견",
    "src": "assets/photos/cat.jpg",
    "tone": "warm"
  },
  {
    "name": "여행 때 찍은 산",
    "src": "assets/photos/mountain.jpg",
    "tone": "autumn"
  },
  {
    "name": "회사 앞 카페",
    "src": "assets/photos/cafe.jpg",
    "tone": "latte"
  },
  {
    "name": "친구들이랑 여행",
    "src": "assets/photos/friends.jpg",
    "tone": "night"
  },
  {
    "name": "주말 점심",
    "src": "assets/photos/food.jpg",
    "tone": "red"
  }
];

  var PLACES = [
  {
    "q": "근처 카페",
    "results": [
      "포근 카페 · 도보 4분",
      "한빛로스터리 · 도보 7분"
    ]
  },
  {
    "q": "근처 약국",
    "results": [
      "온누리약국 · 도보 3분",
      "한빛약국 · 도보 9분"
    ]
  },
  {
    "q": "집까지 길찾기",
    "results": [
      "버스 401 · 32분",
      "지하철 2호선 · 28분"
    ]
  }
];

  var RECOMMENDED_SEC = 300;
  var EVENT_GAP_SEC = 2;

  function deepFreeze(o){ Object.getOwnPropertyNames(o).forEach(function(k){var v=o[k];if(v&&typeof v==="object")deepFreeze(v);});return Object.freeze(o); }
  var DATA = deepFreeze({THREADS:THREADS, ITEMS:ITEMS, PAGES:PAGES, SEARCHES:SEARCHES, CONTACTS:CONTACTS, CALL_HISTORY:CALL_HISTORY, TASKS:TASKS, PHOTOS:PHOTOS, PLACES:PLACES, RECOMMENDED_SEC:RECOMMENDED_SEC, EVENT_GAP_SEC:EVENT_GAP_SEC});
  if(typeof module!=="undefined" && module.exports)module.exports=DATA;else root.MK_PHONE=DATA;
})(this);
