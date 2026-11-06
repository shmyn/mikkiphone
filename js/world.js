/* Shared offline catalog, personal profiles and richer everyday app surfaces. */
(function () {
  "use strict";
  var MK=window.MK,el=MK.el,btn=MK.btn;
  var PRODUCTS=[
    {id:"knit",name:"데일리 라운드 니트",subtitle:"아이보리 · 프리사이즈",category:"fashion",photo:"knit",price:39000,old:49000,rating:"4.7",reviews:1248,delivery:"오늘 도착",options:["아이보리","오트밀","차콜"],description:"적당히 여유 있는 핏의 데일리 니트. 셔츠 위에 겹쳐 입기 좋은 두께로, 소매와 밑단은 탄탄한 시보리로 마감했어요.",specs:["소재: 아크릴 혼방","사이즈: FREE / 총장 62cm","세탁: 찬물 손세탁 권장"]},
    {id:"headphones",name:"오버이어 무선 헤드폰",subtitle:"블랙 · 휴대용 파우치 포함",category:"digital",photo:"headphones",price:54900,old:79000,rating:"4.6",reviews:836,delivery:"내일 도착",options:["블랙"],description:"출퇴근길부터 책상 앞까지 편하게 쓰는 무선 헤드폰. 푹신한 이어패드와 접이식 구조로 보관 부담을 줄였어요.",specs:["연결: 블루투스 / 유선 겸용","재생: 최대 30시간","구성: 본체, 충전 케이블, 파우치"]},
    {id:"sneakers",name:"가벼운 데일리 러닝화",subtitle:"레드 · 통기성 메쉬",category:"fashion",photo:"sneakers",price:69800,old:89000,rating:"4.8",reviews:2104,delivery:"내일 도착",options:["240","250","260","270"],description:"산책과 가벼운 운동에 어울리는 러닝화. 발등을 감싸는 메쉬 소재와 쿠션감 있는 밑창으로 오래 걸어도 편안해요.",specs:["색상: 레드","겉감: 메쉬 혼방","착용감: 정사이즈 권장"]},
    {id:"backpack",name:"15인치 노트북 수납 백팩",subtitle:"네이비 · 생활 방수",category:"fashion",photo:"backpack",price:32900,old:45900,rating:"4.7",reviews:562,delivery:"내일 도착",options:["네이비"],description:"노트북, 충전기, 텀블러를 나눠 담을 수 있는 수납형 백팩. 과한 장식 없이 출근과 여행 모두에 어울리는 디자인이에요.",specs:["수납: 15인치 노트북","크기: 30 × 43 × 14cm","포켓: 내부 4개 / 외부 2개"]},
    {id:"watch",name:"미니멀 데일리 손목시계",subtitle:"화이트 · 실리콘 스트랩",category:"digital",photo:"watch",price:28900,old:39900,rating:"4.5",reviews:329,delivery:"모레 도착",options:["화이트"],description:"가벼운 스트랩과 단정한 디자인으로 매일 착용하기 좋은 손목시계. 기본적인 시간 확인에 집중한 심플한 모델이에요.",specs:["밴드: 실리콘","구성: 시계, 보관 케이스","관리: 부드러운 천으로 닦아 주세요"]},
    {id:"mug",name:"무광 세라믹 머그 350ml",subtitle:"오프화이트 · 1개",category:"home",photo:"mug",price:8900,old:12000,rating:"4.8",reviews:1845,delivery:"내일 도착",options:["오프화이트"],description:"입에 닿는 부분이 부드럽고 손잡이가 넉넉한 세라믹 머그. 매일 마시는 커피와 차를 조금 더 편안하게 즐겨보세요.",specs:["용량: 350ml","재질: 도자기","전자레인지 사용 가능"]},
    {id:"keyboard",name:"슬림 무선 키보드",subtitle:"화이트 · 저소음 키",category:"digital",photo:"keyboard",price:27900,old:35900,rating:"4.6",reviews:720,delivery:"내일 도착",options:["화이트"],description:"책상 공간을 넓게 쓸 수 있는 슬림 키보드. 낮은 키 높이와 단정한 배열로 문서 작업에 편하게 사용할 수 있어요.",specs:["배열: 컴팩트","연결: 무선","구성: 키보드, 사용 설명서"]},
    {id:"lamp",name:"각도 조절 데스크 램프",subtitle:"차콜 · LED",category:"home",photo:"lamp",price:21900,old:32000,rating:"4.7",reviews:481,delivery:"내일 도착",options:["차콜"],description:"필요한 곳에 빛을 모아주는 데스크 램프. 헤드 각도를 조절할 수 있어 독서와 노트 필기에 활용하기 좋아요.",specs:["전원: 유선","광원: LED","용도: 책상 / 침대 옆"]},
    {id:"mouse",name:"무소음 무선 마우스",subtitle:"그레이 · 리시버 포함",category:"digital",photo:"mouse",price:18900,old:24900,rating:"4.7",reviews:3062,delivery:"내일 도착",options:["그레이"],description:"회의 중이나 조용한 사무실에서도 부담 없이 쓰는 무선 마우스. 손에 자연스럽게 맞는 곡선형 바디로 만들었어요.",specs:["연결: USB 리시버","버튼: 3버튼","전원: 건전지"]}
  ];
  var PROFILES={"지수":"cat","엄마":"wedding","서연":"profile-seoyeon","유진":"profile-yujin","박지훈 팀장":"profile-park","박 팀장":"profile-park","최유나 사원":"mug","김민수 대리":"workspace","이준호 (한빛상사)":"mountain","아빠":"sea","소소한 주말 (5)":"friends","대학 동기 (12)":"friends"};
  MK.WORLD={products:PRODUCTS,profiles:PROFILES};
  function money(n){return n.toLocaleString()+"원";}
  function image(name,alt,cls){return el("img",{cls:cls||"",attrs:{src:"assets/photos/"+name+".jpg",alt:alt,loading:"lazy"}});}
  function product(id){return PRODUCTS.filter(function(p){return p.id===id;})[0]||PRODUCTS[0];}
  MK.shopView=function(opts){
    opts=opts||{};var tab=opts.tab||"home",state=MK.S.shop=MK.S.shop||{cart:{},saved:{},options:{},message:"",scroll:{},recent:[]};
    var host=el("div",{cls:"market market-"+(opts.surface||"phone")});
    var parts=tab.split(":"),current=product(parts[1]),totalCount=Object.keys(state.cart).reduce(function(n,id){return n+state.cart[id];},0);
    if((parts[0]==="product"||parts[0]==="reviews") && state.recent[0]!==current.id)state.recent=[current.id].concat(state.recent.filter(function(id){return id!==current.id;})).slice(0,6);
    function nav(next){state.message="";state.scroll[(opts.surface||"phone")+":"+next]=0;opts.onNavigate(next);}
    function notify(text){state.message=text;host.replaceChildren();build();}
    function card(p){
      return el("button",{cls:"market-product",attrs:{"data-act":"product-"+p.id},onClick:function(){nav("product:"+p.id);}},
        image(p.photo,p.name),el("span",{cls:"market-delivery",text:"로켓배송"}),el("strong",{text:p.name}),el("small",{text:p.subtitle}),el("span",{cls:"market-price"},el("em",{text:Math.round((1-p.price/p.old)*100)+"%"}),el("b",{text:money(p.price)})),el("span",{cls:"market-rating",text:"★★★★★ "+p.rating+" ("+p.reviews.toLocaleString()+")"}),el("span",{cls:"market-arrival",text:p.delivery}));
    }
    function build(){
      if(opts.onVisit)opts.onVisit(tab);
      host.appendChild(el("div",{cls:"market-toolbar"},btn("market-search",parts[0]==="category"?"선택한 카테고리의 상품":"어떤 상품을 찾으세요?",function(){nav("categories");},"shop-search"),btn("market-cart-count","장바구니 "+totalCount,function(){nav("cart");},"shop-cart")));
      var navs=el("nav",{cls:"market-nav"});[["home","추천"],["categories","카테고리"],["orders","주문내역"],["saved","찜"],["notice","고객센터"]].forEach(function(item){navs.appendChild(btn(parts[0]===item[0]?"active":"",item[1],function(){nav(item[0]);},"shop-"+item[0]));});host.appendChild(navs);
      if(state.message)host.appendChild(el("p",{cls:"market-status",text:state.message,attrs:{role:"status"}}));
      if(parts[0]==="product"||parts[0]==="reviews"){
        host.appendChild(btn("market-back","상품 목록",function(){nav("home");}));
        var hero=el("section",{cls:"market-detail"},image(current.photo,current.name,"market-detail-photo"));
        var info=el("div",{cls:"market-detail-info"},el("span",{cls:"market-delivery",text:"로켓배송"}),el("h2",{text:current.name}),el("p",{cls:"market-rating",text:"★★★★★ "+current.rating+" · 상품평 "+current.reviews.toLocaleString()+"개"}),el("del",{text:money(current.old)}),el("strong",{cls:"market-detail-price",text:money(current.price)}),el("p",{cls:"market-arrival",text:current.delivery+" 예정 · 무료배송"}));
        var options=el("div",{cls:"market-options"});current.options.forEach(function(option){options.appendChild(btn((state.options[current.id]||current.options[0])===option?"selected":"",option,function(){state.options[current.id]=option;notify(option+" 선택");},"option-"+current.id));});info.appendChild(options);
        info.appendChild(el("div",{cls:"market-buy-actions"},btn("market-save",state.saved[current.id]?"찜한 상품":"찜하기",function(){state.saved[current.id]=!state.saved[current.id];notify(state.saved[current.id]?"찜한 상품에 추가했어요.":"찜을 해제했어요.");},"save-product"),btn("market-add","장바구니 담기",function(){state.cart[current.id]=(state.cart[current.id]||0)+1;nav("cart");},"add-cart")));
        hero.appendChild(info);host.appendChild(hero);
        var tabs=el("div",{cls:"market-detail-tabs"},btn(parts[0]==="product"?"active":"","상품정보",function(){nav("product:"+current.id);}),btn(parts[0]==="reviews"?"active":"","상품평",function(){nav("reviews:"+current.id);},"product-reviews"));host.appendChild(tabs);
        if(parts[0]==="reviews"){
          [["김*연","사진이랑 색 차이 거의 없네요. 포장도 깔끔하게 왔어요."],["박*수","배송 빨랐고 며칠 써보니 무난합니다. 이 가격이면 만족해요."],["이*진","집에서 쓰려고 샀는데 생각보다 괜찮아서 하나 더 살까 고민 중이에요."]].forEach(function(review,i){host.appendChild(el("article",{cls:"market-review"},el("strong",{text:review[0]}),el("span",{text:i===1?"★★★★☆":"★★★★★"}),el("small",{text:"구매 옵션: "+current.options[i%current.options.length]}),el("p",{text:review[1]})));});
        }else{
          host.appendChild(el("section",{cls:"market-description"},el("h3",{text:"상품 소개"}),el("p",{text:current.description}),image(current.photo,current.name,"market-description-photo")));
          var specs=el("section",{cls:"market-specs"},el("h3",{text:"상품 정보"}));current.specs.forEach(function(spec){specs.appendChild(el("p",{text:spec}));});host.appendChild(specs);
        }
        host.appendChild(el("h3",{cls:"market-section-title",text:"함께 둘러본 상품"}));var related=el("div",{cls:"market-products"});PRODUCTS.filter(function(p){return p.id!==current.id;}).slice(0,4).forEach(function(p){related.appendChild(card(p));});host.appendChild(related);
      }else if(parts[0]==="saved"){
        host.appendChild(el("h2",{cls:"market-section-title",text:"찜한 상품"}));var saved=PRODUCTS.filter(function(p){return state.saved[p.id];});var savedGrid=el("div",{cls:"market-products"});saved.forEach(function(p){savedGrid.appendChild(card(p));});host.appendChild(savedGrid);if(!saved.length)host.appendChild(el("p",{cls:"market-empty",text:"마음에 드는 상품을 찜해두면 여기에서 모아볼 수 있어요."}));
      }else if(parts[0]==="cart"||parts[0]==="checkout"){
        host.appendChild(el("h2",{cls:"market-section-title",text:parts[0]==="checkout"?"주문서 확인":"장바구니"}));var total=0;
        Object.keys(state.cart).filter(function(id){return state.cart[id]>0;}).forEach(function(id){var p=product(id),quantity=state.cart[id];total+=p.price*quantity;
          host.appendChild(el("article",{cls:"market-cart-item"},image(p.photo,p.name),el("div",null,el("strong",{text:p.name}),el("small",{text:state.options[id]||p.options[0]}),el("b",{text:money(p.price)}),el("div",{cls:"market-quantity"},btn("","−",function(){state.cart[id]=Math.max(0,quantity-1);opts.onNavigate(tab);},"quantity-minus-"+id),el("span",{text:quantity}),btn("","+",function(){state.cart[id]=quantity+1;opts.onNavigate(tab);},"quantity-plus-"+id)))));
        });
        if(!total)host.appendChild(el("p",{cls:"market-empty",text:"장바구니가 비어 있어요. 마음에 드는 상품을 담아보세요."}));
        else host.appendChild(el("div",{cls:"market-total"},el("span",{text:"상품 합계 · 배송비 무료"}),el("strong",{text:money(total)}),parts[0]==="checkout"?el("p",{text:"배송지: 집 · 실제 결제는 진행되지 않는 주문 미리보기입니다."}):btn("market-add","주문서 보기",function(){nav("checkout");},"shop-checkout")));
      }else if(parts[0]==="orders"){
        host.appendChild(el("h2",{cls:"market-section-title",text:"주문내역"}));
        [["knit",MK.S.delivered.L3?"배송완료":MK.S.delivered.L2?"배송중":"배송준비", "11월 4일 주문"],["mug","배송완료","10월 29일 주문"],["backpack","배송완료","10월 15일 주문"]].forEach(function(order){var p=product(order[0]);host.appendChild(el("article",{cls:"market-order"},el("header",null,el("strong",{text:order[1]}),el("small",{text:order[2]})),el("div",{cls:"market-order-main"},image(p.photo,p.name),el("div",null,el("strong",{text:p.name}),el("p",{text:money(p.price)+" · 1개"}),el("small",{text:order[0]==="knit"?"CJ대한통운 · 배송지: 집":"수령 장소: 문 앞"}))),el("div",{cls:"market-order-actions"},btn("","상품 보기",function(){nav("product:"+p.id);}),btn("","배송 조회",function(){nav("tracking:"+p.id);},"track-"+p.id))));});
      }else if(parts[0]==="tracking"){
        host.appendChild(el("section",{cls:"market-description"},el("h2",{text:"배송 조회"}),image(current.photo,current.name,"market-track-photo"),el("strong",{text:current.name}),el("p",{text:current.id!=="knit"||MK.S.delivered.L3?"배송이 완료되었습니다. 수령 장소: 문 앞":MK.S.delivered.L2?"기사님이 배송 중입니다. 오늘 도착 예정이에요.":"상품을 준비하고 있어요. 발송되면 배송 상태가 표시됩니다."}),el("p",{text:"CJ대한통운 · 운송장 68●● ●●●● 1024"}),el("ol",{cls:"market-tracking"},el("li",{text:"상품 준비"}),el("li",{text:"택배사 상품 인수"}),el("li",{text:"배송 출발"}),el("li",{text:current.id!=="knit"||MK.S.delivered.L3?"배송 완료":"배달 예정"}))));
      }else if(parts[0]==="notice"){
        host.appendChild(el("h2",{cls:"market-section-title",text:"고객센터"}));
        [["배송 일정 및 주문 조회 안내","delivery"],["쿠폰 사용과 적용 순서","coupon"],["고객센터 안내 및 사칭 연락 주의","security"]].forEach(function(notice){host.appendChild(btn("market-notice",notice[0],function(){nav("notice-detail:"+notice[1]);},"notice-"+notice[1]));});
        host.appendChild(el("p",{cls:"market-support-note",text:"주문한 상품의 배송 상태는 주문내역에서 확인할 수 있습니다."}));
      }else if(parts[0]==="notice-detail"){
        var security=parts[1]==="security";host.appendChild(el("article",{cls:"market-description"},el("h2",{text:security?"고객센터 안내 및 사칭 연락 주의":parts[1]==="coupon"?"쿠폰 사용 안내":"배송 조회 안내"}),el("small",{text:"고객센터 · 11월 3일"}),el("p",{text:security?"최근 고객센터를 사칭해 보상금 조회나 별도 프로그램 설치를 안내하는 연락이 접수되고 있습니다. 보상·개인정보 관련 안내는 앱 고객센터의 공지에서 확인해 주세요. 설치 파일을 문자나 이메일로 보내드리지 않습니다.":parts[1]==="coupon"?"쿠폰은 주문서에서 적용 가능한 항목을 확인할 수 있습니다. 일부 상품과 중복 할인에는 사용이 제한될 수 있습니다.":"주문내역에서 상품별 배송 조회를 선택하면 택배사의 현재 배송 상태를 확인할 수 있습니다. 묶음 배송은 상품별로 도착일이 다를 수 있습니다."}))); 
      }else{
        var categories=el("div",{cls:"market-categories"});[["all","전체"],["fashion","패션"],["digital","디지털"],["home","주방·생활"]].forEach(function(category){categories.appendChild(btn(parts[1]===category[0]?"active":"",category[1],function(){nav("category:"+category[0]);},"category-"+category[0]));});host.appendChild(categories);
        if(parts[0]==="home"){
          host.appendChild(el("section",{cls:"market-hero"},el("div",null,el("small",{text:"매일 쓰는 물건, 가볍게 새로"}),el("h2",{text:"책상 위에 작은 변화"}),el("p",{text:"키보드부터 조명까지\n일상을 채우는 데스크 아이템"}),btn("","데스크 아이템 보기",function(){nav("category:digital");})),image("keyboard","화이트 키보드")));
          if(state.recent.length){host.appendChild(el("h3",{cls:"market-section-title",text:"최근 본 상품"}));var recent=el("div",{cls:"market-recent"});state.recent.forEach(function(id){var p=product(id);recent.appendChild(el("button",{onClick:function(){nav("product:"+id);}},image(p.photo,p.name),el("span",{text:p.name})));});host.appendChild(recent);}
          host.appendChild(el("h3",{cls:"market-section-title",text:"이번 주 둘러보기 좋은 상품"}));
        }else host.appendChild(el("h3",{cls:"market-section-title",text:"지금 둘러보기 좋은 상품"}));
        var grid=el("div",{cls:"market-products"});PRODUCTS.filter(function(p){return parts[0]!=="category"||parts[1]==="all"||p.category===parts[1];}).forEach(function(p){grid.appendChild(card(p));});host.appendChild(grid);
      }
    }
    host.addEventListener("scroll",function(){state.scroll[(opts.surface||"phone")+":"+tab]=host.scrollTop;});
    build();setTimeout(function(){host.scrollTop=state.scroll[(opts.surface||"phone")+":"+tab]||0;},0);return host;
  };
  MK.companyView=function(opts){
    var tab=opts.tab||"home",host=el("div",{cls:"company-site"});
    host.appendChild(el("header",{cls:"company-top"},el("strong",{text:"HANBIT"}),el("small",{text:"한빛상사"})));
    var nav=el("nav",{cls:"company-nav"});[["home","회사소개"],["products","제품안내"],["resources","자료실"],["contact","문의"]].forEach(function(item){nav.appendChild(btn(tab===item[0]?"active":"",item[1],function(){opts.onNavigate(item[0]);}));});host.appendChild(nav);
    if(tab==="home"){
      host.appendChild(el("section",{cls:"company-hero"},image("workspace","업무 공간"),el("div",null,el("small",{text:"OFFICE SOLUTIONS"}),el("h2",{text:"일하는 공간을\n더 편하게"}),el("p",{text:"사무용품과 오피스 기기, 필요한 만큼 합리적으로."}),btn("","제품 살펴보기",function(){opts.onNavigate("products");}))));
      host.appendChild(el("section",{cls:"company-intro"},el("h3",{text:"작은 소모품부터 사무실의 큰 변화까지"}),el("p",{text:"한빛상사는 2009년부터 기업 고객의 사무용품 구매와 정기 납품을 함께하고 있습니다. 120여 거래처의 업무 환경에 맞춰 필요한 제품을 제안합니다."}),el("div",{cls:"company-stats"},el("strong",{text:"17년의 납품 경험"}),el("strong",{text:"120+ 거래처"}),el("strong",{text:"정기 배송 지원"})),btn("company-resource-link","회사 소개서 다운로드",opts.onDownload,"clickfix"),btn("company-resource-link","담당자에게 메일로 요청",opts.onContact,"page-act")));
    }else if(tab==="products"||tab.indexOf("product:")===0){
      if(tab.indexOf("product:")===0){var p=product(tab.split(":")[1]);host.appendChild(el("section",{cls:"company-product-detail"},image(p.photo,p.name),el("h2",{text:p.name}),el("p",{text:p.description}),el("p",{text:"사업자 정기 납품 · 수량별 견적 협의"}),el("p",{text:p.specs.join(" / ")}),btn("","담당자 문의",opts.onContact)));}
      else{host.appendChild(el("h2",{cls:"company-section-title",text:"업무에 맞는 제품을 찾아보세요"}));var grid=el("div",{cls:"company-products"});PRODUCTS.filter(function(p){return ["keyboard","mouse","lamp","mug"].indexOf(p.id)>=0;}).forEach(function(p){grid.appendChild(el("button",{onClick:function(){opts.onNavigate("product:"+p.id);},attrs:{"data-act":"company-product-"+p.id}},image(p.photo,p.name),el("strong",{text:p.name}),el("small",{text:"제품 상세 보기"})));});host.appendChild(grid);}
    }else if(tab==="resources"){
      host.appendChild(el("section",{cls:"company-resources"},el("h2",{text:"자료실"}),el("p",{text:"회사소개서 · 2026년판 / PDF 4MB"}),el("p",{text:"주요 취급 품목과 정기 납품 서비스를 안내합니다."}),btn("","회사 소개서 다운로드",opts.onDownload,"clickfix"),el("small",{text:"다운로드가 어려우면 담당자에게 이메일로 요청하실 수 있습니다."}),btn("company-secondary","담당자에게 메일로 요청",opts.onContact,"page-act")));
    }else{
      host.appendChild(el("section",{cls:"company-resources"},el("h2",{text:"영업 문의"}),el("p",{text:"영업1팀 이준호 과장"}),el("p",{text:"jh.lee@hanbit-trade.example"}),el("p",{text:"평일 09:00–18:00 · 점심시간 12:00–13:00"}),el("p",{text:"발주 품목과 수량을 알려주시면 견적을 보내드립니다."}),btn("","담당자에게 메일로 요청",opts.onContact,"page-act")));
    }
    host.appendChild(el("footer",{text:"HANBIT TRADING · 기업 사무용품 · 공급부터 배송까지"}));return host;
  };
})();
