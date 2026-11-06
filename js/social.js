/* 실제 전송 없이 세션 안에서만 동작하는, 서로 독립된 X·블로그 화면. */
(function () {
  "use strict";
  var MK = window.MK, el = MK.el, btn = MK.btn, icon = MK.icon;
  var POSTS = [
    { id: "cat", name: "고양이와 출근", handle: "@monday_cat", time: "18분", text: "잠깐 물 마시고 왔더니 제 자리 주인이 바뀌었는데요", image: "cat", count: 184, comments: ["표정이 이미 팀장님인데요ㅋㅋ", "의자 따뜻하게 데워주는 중"] },
    { id: "sea", name: "파도 수집가", handle: "@slow_wave", time: "43분", text: "소리까지 저장할 수 있으면 좋겠다. 바다 보고 온 날은 한동안 사진만 들여다보게 됨.", image: "sea", count: 92, comments: ["색감 너무 좋아요", "저도 이번 주말엔 바다 가려고요"] },
    { id: "train", name: "출근길 낙서", handle: "@daily_note", time: "1시간", text: "지하철에서 책 세 쪽 읽었는데 내릴 역 도착함. 그래도 어제보다 세 쪽 더 읽은 사람 됐다", count: 367, comments: ["세 쪽이면 성공이죠", "저는 이어폰 찾다가 도착했어요"] }
  ];
  var ARTICLES = [
    { id: "desk", name: "기록하는 직장인", title: "회의를 30분 안에 끝내는 기록 습관", category: "일과 기록", date: "2026. 11. 6. 08:30", photo: "workspace", excerpt: "길어진 회의록을 다시 읽다가 바꿔본 작은 습관. 결정한 일과 다음 행동을 나눠 적었더니 달라진 것들.", paragraphs: ["회의가 끝나고 나면 열심히 적은 메모는 있는데 정작 누가 무엇을 하기로 했는지 기억나지 않는 날이 있었다. 그래서 이번 주부터는 노트의 첫 줄에 오늘 결정할 일을 하나만 적기 시작했다.", "회의 중에는 결정한 일, 담당자, 확인할 날짜만 같은 위치에 적었다. 정리할 때 문장을 예쁘게 고치느라 시간을 쓰는 대신 다음 행동이 빠졌는지를 확인했다.", "완벽한 방법은 아니지만 회의가 끝난 뒤 다시 질문하는 일이 확실히 줄었다. 다음 주에도 이 형식으로 기록을 쌓아볼 생각이다."], count: 28 },
    { id: "hike", name: "느리게 걷기", title: "풍경 보느라 자꾸 멈춘 날, 산책 같은 트레킹", category: "여행", date: "2026. 11. 4. 19:12", photo: "mountain", excerpt: "등산화 끈을 고쳐 묶고 출발. 빨리 걷는 대신 천천히 풍경을 보는 여행을 기록합니다.", paragraphs: ["이번 여행에서는 정상에 몇 시에 도착할지 정하지 않았다. 숨이 차면 쉬고, 눈에 들어오는 풍경이 있으면 한참 서서 봤다.", "사진으로는 바람 소리를 담을 수 없어 아쉬웠다. 대신 그때 어떤 냄새가 났는지, 어디에서 오래 쉬었는지를 수첩에 짧게 남겼다.", "준비물은 편한 신발, 물, 가벼운 겉옷. 다음에는 같은 길을 다른 계절에 걸어보고 싶다."], count: 41 },
    { id: "lunch", name: "오늘의 한 접시", title: "냉장고 재료로 만든 주말 점심 한 그릇", category: "요리", date: "2026. 11. 3. 13:05", photo: "food", excerpt: "남은 채소를 한꺼번에 꺼내서 가볍게 먹은 점심. 따로 장 보러 가지 않아도 꽤 그럴듯한 한 끼가 됐다.", paragraphs: ["냉장고를 정리하다 남은 채소가 조금씩 보였다. 따로 먹기에는 애매해서 모두 꺼내 한 접시에 담았다.", "잎채소는 물기를 충분히 빼고, 단단한 재료는 한입 크기로 잘랐다. 소스는 올리브오일과 소금을 조금만 넣었다.", "요리라고 부르기 민망할 정도로 간단하지만 주말에 자주 해 먹을 것 같다. 다음에는 구운 버섯을 더해볼 생각."], count: 19 }
  ];
  MK.socialView = function (kind) {
    var state = MK.S.social = MK.S.social || { likes: {}, following: {}, article: null, xTab: "home", blogTab: "home", comments: {}, replies: {}, saved: {} };
    var host = el("div", { cls: "social-feed social-" + kind });
    function change(key, value) { state[key] = value; state[kind + "Scroll"] = 0; draw(); }
    function photo(name, alt, cls) { return el("img", { cls: cls || "post-photo", attrs: { src: "assets/photos/" + name + ".jpg", alt: alt, loading: "lazy" } }); }
    function nav(items, current, onClick) {
      var n = el("nav", { cls: "social-bottom-nav", attrs: { "aria-label": kind === "x" ? "X 탐색" : "블로그 탐색" } });
      items.forEach(function (it) { n.appendChild(el("button", { cls: "social-nav-item" + (current === it[0] ? " active" : ""), attrs: { "aria-label": it[2] }, onClick: function () { onClick(it[0]); } }, icon(it[1],22), el("span",{text:it[2]}))); }); return n;
    }
    function xPost(p) {
      var liked = !!state.likes[p.id], card = el("article", { cls: "social-post" });
      card.appendChild(el("div", { cls: "post-head" }, MK.avatar(p.name, true), el("div", null, el("strong", { text: p.name }), el("span", { cls: "post-handle", text: p.handle + " · " + p.time })), btn("follow-btn", state.following[p.id] ? "팔로잉" : "팔로우", function () { state.following[p.id] = !state.following[p.id]; draw(); }, "follow-" + p.id)));
      card.appendChild(el("p",{text:p.text}));
      if (p.image) card.appendChild(photo(p.image,p.id === "cat" ? "의자에 앉은 고양이" : "바닷가의 파도"));
      card.appendChild(el("div",{cls:"post-actions"},
        btn("social-comment", "댓글 " + (p.comments.length + (state.replies[p.id] ? 1 : 0)), function(){state.comments[p.id]=!state.comments[p.id];draw();}, "comments-"+p.id),
        btn("social-like"+(liked?" liked":""), (liked?"♥ ":"♡ ")+(p.count+(liked?1:0)), function(){state.likes[p.id]=!liked;draw();}, "like-"+p.id),
        btn("social-bookmark", state.saved[p.id]?"저장됨":"저장", function(){state.saved[p.id]=!state.saved[p.id];draw();}, "save-"+p.id)));
      if (state.comments[p.id]) {
        var comments=el("div",{cls:"x-comments"});
        p.comments.concat(state.replies[p.id]?["나: "+state.replies[p.id]]:[]).forEach(function(text){comments.appendChild(el("p",{text:text}));});
        if (!state.replies[p.id]) comments.appendChild(btn("reply-preset","좋은 하루 보내세요",function(){state.replies[p.id]="좋은 하루 보내세요";draw();},"comment-reply-"+p.id));
        card.appendChild(comments);
      }
      return card;
    }
    function drawX() {
      host.appendChild(el("header",{cls:"x-header"},MK.avatar("김하늘",true),el("span",{cls:"x-wordmark",text:"𝕏"}),MK.iconBtn("navbtn","search","탐색",function(){change("xTab","search");})));
      var body=el("div",{cls:"social-scroll"});
      if(state.xTab==="home"){
        body.appendChild(el("div",{cls:"social-tabs"},btn(!state.onlyFollowing?"selected":"","추천",function(){state.onlyFollowing=false;state.xFocus=null;draw();}),btn(state.onlyFollowing?"selected":"","팔로우 중",function(){state.onlyFollowing=true;state.xFocus=null;draw();})));
        var posts=POSTS.filter(function(p){return (!state.xFocus || p.id===state.xFocus) && (!state.onlyFollowing||state.following[p.id]);});
        posts.forEach(function(p){body.appendChild(xPost(p));});
        if(!posts.length)body.appendChild(el("p",{cls:"social-empty",text:"추천 피드에서 관심 있는 계정을 팔로우해 보세요."}));
      }else if(state.xTab==="search"){
        body.appendChild(el("h2",{cls:"social-section-title",text:"지금 많이 이야기하는 주제"}));
        [["일상","고양이","cat"],["여행","바다 사진","sea"],["라이프","출근길 독서","train"]].forEach(function(t){body.appendChild(btn("x-trend",t[0]+" · "+t[1],function(){state.xTab="home";state.onlyFollowing=false;state.xFocus=t[2];draw();},"trend-"+t[2]));});
      }else if(state.xTab==="notifications"){
        body.appendChild(el("h2",{cls:"social-section-title",text:"알림"}));body.appendChild(el("p",{cls:"social-empty",text:"아직 새로운 알림이 없습니다."}));
      }else{
        body.appendChild(el("div",{cls:"x-profile"},MK.avatar("김하늘",true),el("h2",{text:"하늘"}),el("p",{text:"@haneul_daily"}),el("p",{text:"일하고, 걷고, 가끔 기록합니다."})));
        body.appendChild(el("h3",{cls:"social-section-title",text:"저장한 게시물"}));
        var saved=POSTS.filter(function(p){return state.saved[p.id];});saved.forEach(function(p){body.appendChild(xPost(p));});if(!saved.length)body.appendChild(el("p",{cls:"social-empty",text:"게시물의 저장 버튼을 누르면 여기에 모아볼 수 있어요."}));
      }
      body.addEventListener("scroll",function(){state[kind + "Scroll"]=body.scrollTop;});
      body.scrollTop=state[kind + "Scroll"] || 0;
      host.appendChild(body);host.appendChild(nav([["home","home","홈"],["search","search","탐색"],["notifications","bell","알림"],["profile","person","프로필"]],state.xTab,function(tab){state.xFocus=null;change("xTab",tab);}));
    }
    function articleCard(a,full){
      var card=el("article",{cls:full?"blog-article blog-full":"blog-feed-card"});
      card.appendChild(el("div",{cls:"blog-author"},MK.avatar(a.name,true),el("span",null,el("strong",{text:a.name}),el("small",{text:a.category+" · "+a.date}))));
      card.appendChild(el("h3",{text:a.title}));
      card.appendChild(photo(a.photo,a.title));
      if(full){
        a.paragraphs.forEach(function(text){card.appendChild(el("p",{cls:"blog-body",text:text}));});
        card.appendChild(el("p",{cls:"blog-tags",text:"#"+a.category.replace(/ /g,"")+" #일상기록 #나의기록"}));
        card.appendChild(btn("blog-read","목록으로",function(){state.article=null;draw();},"blog-back"));
      }else{
        card.appendChild(el("p",{cls:"blog-excerpt",text:a.excerpt}));
        card.appendChild(btn("blog-read","글 읽기",function(){state.article=a.id;state.blogScroll=0;draw();},"blog-read-"+a.id));
      }
      card.appendChild(el("div",{cls:"blog-card-footer"},btn("social-like"+(state.likes[a.id]?" liked":""),(state.likes[a.id]?"♥ ":"♡ ")+"공감 "+(a.count+(state.likes[a.id]?1:0)),function(){state.likes[a.id]=!state.likes[a.id];draw();},"like-"+a.id),btn("blog-neighbor",state.following[a.id]?"이웃":"이웃추가",function(){state.following[a.id]=!state.following[a.id];draw();},"neighbor-"+a.id)));
      return card;
    }
    function drawBlog(){
      host.appendChild(el("header",{cls:"blog-header"},el("strong",{text:"blog"}),el("span",{cls:"blog-header-label",text:state.article?"이웃의 기록":""}),MK.iconBtn("navbtn","search","블로그 관심사 찾기",function(){state.article=null;change("blogTab","search");}),MK.iconBtn("navbtn","menu","내 블로그",function(){state.article=null;change("blogTab","mine");})));
      var body=el("div",{cls:"social-scroll blog-scroll"});
      if(state.article){var article=ARTICLES.filter(function(a){return a.id===state.article;})[0];if(article)body.appendChild(articleCard(article,true));}
      else if(state.blogTab==="home"){
        body.appendChild(el("section",{cls:"blog-discovery"},el("p",{text:"오늘의 발견"}),el("h2",{text:"지금 뜨고 있는 이웃 보셨나요?"}),el("div",{cls:"blog-discovery-grid"},
          el("button",{onClick:function(){state.article="hike";draw();}},photo("mountain","여행 기록"),el("span",{text:"천천히 걷는 여행"})),
          el("button",{onClick:function(){state.article="lunch";draw();}},photo("food","주말 요리"),el("span",{text:"오늘의 한 접시"})))));
        ARTICLES.forEach(function(a){body.appendChild(articleCard(a,false));});
      }else if(state.blogTab==="neighbors"){
        body.appendChild(el("h2",{cls:"social-section-title",text:"이웃 새글"}));var items=ARTICLES.filter(function(a){return state.following[a.id];});items.forEach(function(a){body.appendChild(articleCard(a,false));});if(!items.length)body.appendChild(el("p",{cls:"social-empty",text:"홈에서 이웃을 추가하면 새글을 모아볼 수 있어요."}));
      }else if(state.blogTab==="search"){
        body.appendChild(el("h2",{cls:"social-section-title",text:"관심 있는 기록 찾기"}));ARTICLES.forEach(function(a){body.appendChild(btn("blog-topic",a.category,function(){state.article=a.id;draw();},"blog-topic-"+a.id));});
      }else if(state.blogTab==="notifications"){
        body.appendChild(el("h2",{cls:"social-section-title",text:"내 소식"}));body.appendChild(el("p",{cls:"social-empty",text:"새로운 소식이 없습니다."}));
      }else{
        body.appendChild(el("div",{cls:"blog-my-cover"},photo("workspace","내 블로그 커버"),el("strong",{text:"하늘의 업무 노트"}),el("span",{text:"기록하며 배우는 하루"})));
        body.appendChild(el("p",{cls:"blog-intro",text:"작은 시도를 기록합니다. 일과 생활 사이에서 발견한 것들을 천천히 남겨요."}));
        body.appendChild(el("h3",{cls:"social-section-title",text:"공감한 글"}));var liked=ARTICLES.filter(function(a){return state.likes[a.id];});liked.forEach(function(a){body.appendChild(articleCard(a,false));});if(!liked.length)body.appendChild(el("p",{cls:"social-empty",text:"마음에 드는 글에 공감을 남겨보세요."}));
      }
      body.addEventListener("scroll",function(){state[kind + "Scroll"]=body.scrollTop;});
      body.scrollTop=state[kind + "Scroll"] || 0;
      host.appendChild(body);host.appendChild(nav([["home","home","홈"],["neighbors","person","이웃"],["notifications","bell","내 소식"],["mine","file","내 블로그"]],state.blogTab,function(tab){state.article=null;change("blogTab",tab);}));
    }
    function draw(){host.replaceChildren();if(kind==="x")drawX();else drawBlog();}
    draw();return host;
  };
})();
