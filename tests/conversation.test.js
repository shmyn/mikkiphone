const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function engine() {
  class Node {
    constructor(tag) { this.tag = tag; this.children = []; this.attrs = {}; this.style = {}; this.textContent = ''; this.classList = { add: (...names) => { this.className += ' ' + names.join(' '); } }; }
    appendChild(n) { this.children.push(n); n.parentNode = this; return n; }
    cloneNode(deep) {
      const copy=new Node(this.tag);copy.className=this.className;copy.textContent=this.textContent;copy.attrs={...this.attrs};
      if(deep)this.children.forEach(child=>copy.appendChild(child.cloneNode ? child.cloneNode(true) : {...child}));
      return copy;
    }
    querySelectorAll(selector) {
      const names=selector.split(',').map(s=>s.trim().slice(1,-1));
      return allNodes(this).slice(1).filter(node=>names.some(name=>Object.hasOwn(node.attrs||{},name)));
    }
    get firstChild() { return this.children[0]; }
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(n => n !== this); }
    replaceChildren(...kids) { this.children = kids; }
    setAttribute(k, v) { this.attrs[k] = v; }
    removeAttribute(k) { delete this.attrs[k]; }
    addEventListener(type, run) { this[type] = run; }
    focus() {}
    querySelector(selector) {
      const parts=selector.split(',').map(s=>s.trim());
      return allNodes(this).slice(1).find(n=>parts.some(s=>s[0]==='.' ? (n.className||'').split(/\s+/).includes(s.slice(1)) : n.tag===s)) || null;
    }
    get rows() { return this.children.filter(n => n.tag === "tr"); }
  }
  const root = new Node('main');
  const timers = [];
  const clock = { value:100 };
  const captures = [];
  let ticker;
  const windowEvents = {};
  const document = {
    body: new Node('body'), hidden: false,
    getElementById: () => root,
    createElement: tag => {
      const node = new Node(tag);
      if (tag === 'canvas') {
        node.getContext = () => ({drawImage: (...args) => captures.push(args.slice(1)), fillRect() {}});
        node.toDataURL = () => 'data:image/jpeg;base64,LOCAL_CAPTURE';
      }
      return node;
    }, createTextNode: text => ({ textContent: text }),
    addEventListener() {}
  };
  const context = vm.createContext({ document, performance: { now: () => clock.value },
    setTimeout: (fn, at) => { timers.push({fn, at}); }, clearInterval() {}, setInterval(fn) { ticker = fn; return 1; },
    navigator: {}, window: { addEventListener(name, fn) { windowEvents[name] = fn; }, MK_COMMON: require('../js/data.common'), MK_PC: require('../js/data.pc'),
      MK_PHONE: require('../js/data.phone'), MK_SCORING: require('../js/scoring'), MK_CONFIG: { SITE_URL:"https://mikkiphone.example/", LINE_MS:200, RING_SECONDS:15, BANNER_MS:4500 },
      Image: class { constructor(){this.naturalWidth=1200;this.naturalHeight=800;} set src(value){this.source=value;this.onload();} },
      MK_ICON: () => new Node('svg') } });
  for (const name of ['core', 'world', 'social', 'phone', 'pc']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/' + name + '.js'), 'utf8'), context);
  const MK = context.window.MK;
  const PCUI = MK.UI.pc;
  const PhoneUI = MK.UI.phone;
  MK.UI.pc = { mount() {}, onDeliver() {}, render() {}, refreshThread() {} };
  MK.prepare('pc');
  return { MK, PCUI, PhoneUI, root, timers, captures, document, installHistory() {
    const entries=[null];let index=0;
    const history={get state(){return entries[index];},get length(){return entries.length;},pushState(state){entries.splice(++index,entries.length,state);},back(){if(index>0){index--;windowEvents.popstate({state:this.state});}},forward(){if(index+1<entries.length){index++;windowEvents.popstate({state:this.state});}}};
    context.window.history=history;return history;
  }, setDevice(portrait, touch, ua) { context.navigator.maxTouchPoints=touch; context.navigator.userAgent=ua; context.window.matchMedia=q=>({matches:q==="(orientation: portrait)" && portrait}); }, tick(ms) { clock.value += ms; ticker(); }, advance(ms) { clock.value+=ms; if(MK.ui.tick) MK.ui.tick(MK.now()); }, flush() { timers.splice(0).sort((a,b) => a.at-b.at).forEach(t => t.fn()); } };
}

test('메일 요청 → 상대 답장 → 첨부 메일 순서를 유지하고 지난 답장을 되살리지 않는다', () => {
  const {MK, flush} = engine();
  MK.deliver(MK.ITEM.Lp2);
  MK.deliver(MK.ITEM.P1);
  MK.replyChips('pm_partner').find(x => x.label.includes('소개서')).run();
  assert.equal(MK.replyChips('pm_partner').length, 0);
  flush();
  const entries = MK.S.timeline.pm_partner;
  assert.deepEqual(Array.from(entries, e => e.item || e.text), [
    'Lp2', '회사 소개서 보내주실 수 있을까요?', '네, 바로 보내드리겠습니다.', 'Lp11'
  ]);
  assert.ok(!MK.replyChips('pm_partner').some(x => x.label.includes('검토 후')));
});

test('상대 답장 전에는 다음 단계와 중복 클릭을 막는다', () => {
  const {MK, flush} = engine();
  MK.deliver(MK.ITEM.P7);
  const reply = MK.replyChips('pm_p7')[0];
  reply.run(); reply.run();
  assert.equal(MK.S.timeline.pm_p7.length, 2);
  assert.equal(MK.S.st.P7.result, 'entered');
  assert.equal(MK.replyChips('pm_p7').length, 0);
  flush();
  assert.equal(MK.S.timeline.pm_p7.length, 3);
  assert.equal(MK.replyChips('pm_p7').length, 2);
  MK.replyChips('pm_p7').find(x => x.label.includes('핀번호')).run();
  assert.equal(MK.S.st.P7.result, 'exposed');
});

test('이전 세션의 지연 답장과 첨부파일이 다시 하기에 섞이지 않는다', () => {
  const {MK, flush} = engine();
  MK.deliver(MK.ITEM.P1);
  MK.replyChips('pm_partner').find(x => x.label.includes('소개서')).run();
  MK.prepare('pc');
  flush();
  assert.equal(MK.S.timeline.pm_partner, undefined);
  assert.equal(MK.S.delivered.Lp11, undefined);
});

test('PC 메신저도 받은 메시지와 내 답장을 같은 흐름에 기록한다', () => {
  const {MK, flush} = engine();
  MK.deliver(MK.ITEM.Lp5);
  MK.replyChips('pc_kim')[0].run();
  flush();
  assert.deepEqual(Array.from(MK.S.timeline.pc_kim, e => e.item || e.text), ['Lp5', '국밥 가요', '좋아요 12시에 봬요']);
});

test('결과 화면은 공유 링크와 기본으로 펼친 상세 기록을 제공한다', () => {
  const {MK, root} = engine();
  MK.deliver(MK.ITEM.Lp2);
  MK.deliver(MK.ITEM.P2);
  MK.finish();
  const nodes = [];
  function visit(n) { nodes.push(n); (n.children || []).forEach(visit); }
  visit(root);
  const buttons = nodes.filter(n => n.tag === 'button').map(n => n.textContent);
  assert.ok(buttons.includes('결과 화면 공유하기'));
  assert.match(nodes.find(n => n.className === 'sharebox').textContent, /\/r\/blocker\.html#0,0,1,0,1$/);
  assert.ok(!buttons.includes('가족·동료에게 보내기'));
  assert.equal(nodes.filter(n => n.tag === 'details' && n.className.includes('r-detail')).length, 1);
  assert.ok(Object.hasOwn(nodes.find(n => n.tag === 'details').attrs, 'open'));
  assert.ok(nodes.some(n => n.className === 'result-stats'));
});


test('PC 메일 화면에도 요청과 첨부 메일이 실제 발생 순서대로 표시된다', () => {
  const {MK, PCUI, root, flush} = engine();
  MK.deliver(MK.ITEM.Lp2);
  MK.deliver(MK.ITEM.P1);
  MK.replyChips('pm_partner').find(x => x.label.includes('소개서')).run();
  flush();
  MK.ui = PCUI;
  PCUI.mount();
  MK.S.running = true;
  PCUI.render();
  function find(n, pred) {
    if (pred(n)) return n;
    for (const c of n.children || []) { const result = find(c, pred); if (result) return result; }
  }
  function click(act) { const node = find(root, n => n.attrs && n.attrs['data-act'] === act); assert.ok(node, act); node.click(); }
  click('desk-mail');
  click('open-pm_partner');
  const body = find(root, n => n.className === 'read-body');
  function text(n) { return n.textContent + (n.children || []).map(text).join(''); }
  const content = text(body);
  assert.ok(content.indexOf('회사 소개서 보내주실 수 있을까요?') < content.indexOf('네, 바로 보내드리겠습니다.'));
  assert.ok(content.indexOf('네, 바로 보내드리겠습니다.') < content.indexOf('회사 소개서 보내드립니다'));
});


function findNode(node, pred) {
  if (pred(node)) return node;
  for (const child of node.children || []) { const found = findNode(child, pred); if (found) return found; }
}
function clickNode(root, pred) { const found = findNode(root, pred); assert.ok(found, "control exists"); found.click(); }

test('한빛상사 홈페이지 → 담당자 메일 요청 → 소개서 열기로 업무를 완료한다', () => {
  const {MK, PCUI, root, flush} = engine();
  MK.ui = PCUI; PCUI.mount(); MK.S.running = true; PCUI.render();
  MK.deliver(MK.ITEM.Lp2);
  act(root,'desk-mail');act(root,'open-pm_partner');act(root,'reply-to-Lp2');
  clickNode(root, n => n.attrs && n.attrs['data-act'] === 'desk-browser');
  clickNode(root, n => n.tag === 'button' && n.textContent === '한빛상사');
  clickNode(root, n => n.tag === 'button' && n.textContent === '담당자에게 메일로 요청');
  act(root,'ask-company-profile');
  // Rendering a mail pane also schedules scroll callbacks.
  flush(); flush();
  assert.equal(MK.S.delivered.Lp11,true);
  clickNode(root, n => n.attrs && n.attrs['aria-label'] === '한빛상사_회사소개서.pdf 열기');
  assert.equal(MK.S.tasks.t3, true);
  assert.equal(MK.S.st.P1.result, 'safe');
});

test('X 좋아요/팔로우와 블로그 글 열기/목록 복귀가 동작한다', () => {
  const {MK} = engine();
  const x = MK.socialView('x');
  clickNode(x, n => n.attrs && n.attrs['data-act'] === 'like-cat');
  clickNode(x, n => n.attrs && n.attrs['data-act'] === 'follow-cat');
  assert.equal(MK.S.social.likes.cat, true);
  assert.equal(MK.S.social.following.cat, true);
  const blog = MK.socialView('blog');
  clickNode(blog, n => n.attrs && n.attrs['data-act'] === 'blog-read-desk');
  assert.equal(MK.S.social.article, 'desk');
  assert.ok(findNode(blog, n => n.className === 'blog-body'));
  clickNode(blog, n => n.attrs && n.attrs['data-act'] === 'blog-back');
  assert.equal(MK.S.social.article, null);
});

test('휴대폰 갤러리 사진과 쿠팡 상품, 소셜 앱을 실제 이미지로 연다', () => {
  const {MK, PhoneUI, root} = engine();
  MK.UI.phone = PhoneUI; MK.prepare('phone');
  MK.S.running = true; MK.S.route = {name:'home'}; MK.ui.render();
  clickNode(root, n => n.attrs && n.attrs['data-act'] === 'app-photos');
  assert.ok(findNode(root, n => n.tag === 'img' && n.attrs.src === 'assets/photos/friends.jpg'));
  MK.S.route = {name:'app', app:'moamall', tab:'orders'}; MK.ui.render();
  assert.ok(findNode(root, n => n.tag === 'img' && n.attrs.src === 'assets/photos/knit.jpg'));
  MK.S.route = {name:'app', app:'x'}; MK.ui.render();
  assert.ok(findNode(root, n => n.attrs && n.attrs['data-act'] === 'like-cat'));
  MK.S.route = {name:'thread', id:'k_jisu'}; MK.ui.render();
  assert.ok(findNode(root, n => n.className && n.className.includes('kakao-messages')));
});


function phoneEngine() {
  const e = engine(); e.MK.UI.phone = e.PhoneUI; e.MK.prepare('phone');
  e.MK.S.running = true; e.MK.S.route = {name:'home'}; e.MK.ui.render(); return e;
}
function textOf(n) { return (n.textContent || '') + (n.children || []).map(textOf).join(''); }
function allNodes(n, out = []) { out.push(n); (n.children || []).forEach(c => allNodes(c, out)); return out; }
function act(root, name) { clickNode(root, n => n.attrs && n.attrs['data-act'] === name); }

test('청첩장 링크는 원문에 붙어 있고 답장을 주고받아도 아래로 이동하지 않는다', () => {
  const {MK, root, flush} = phoneEngine();
  MK.deliver(MK.ITEM.L6); MK.S.route = {name:'thread',id:'k_seoyeon'}; MK.ui.render();
  MK.replyChips('k_seoyeon')[0].run(); flush();
  const nodes = allNodes(root);
  const links = nodes.filter(n => n.attrs && n.attrs['data-act'] === 'link');
  assert.equal(links.length, 1);
  const original = findNode(root, n => n.className === 'message-content' && textOf(n).includes('모바일 청첩장 보낼게'));
  assert.ok(original.children.includes(links[0]));
  assert.ok(nodes.indexOf(links[0]) < nodes.findIndex(n => n.textContent === '축하해!!'));
  assert.ok(nodes.indexOf(links[0]) < nodes.findIndex(n => n.textContent === '고마워 꼭 와 ㅎㅎ'));
});

test('열어 둔 카카오톡 방에도 새 메시지가 즉시 표시된다', () => {
  const {MK, root} = phoneEngine();
  MK.S.route={name:'thread',id:'k_group'}; MK.ui.render();
  MK.deliver(MK.ITEM.A2);
  assert.ok(textOf(root).includes(MK.ITEM.A2.body));
  MK.deliver(MK.ITEM.A3);
  assert.ok(textOf(root).includes(MK.ITEM.A3.body));
  assert.equal(MK.S.unread.A3,false);
});

test('아직 오지 않았거나 읽지 않은 연락을 언급하는 전화 선택지는 표시하지 않는다', () => {
  const {MK, root, advance} = phoneEngine();
  MK.S.route={name:'app',app:'phone',tab:'contacts'}; MK.ui.render();
  act(root,'call-mom'); advance(1000);
  assert.ok(!textOf(root).includes('다른 번호로 카톡'));
  act(root,'hangup'); MK.deliver(MK.ITEM.s5);
  act(root,'call-mom'); advance(1000);
  assert.ok(!textOf(root).includes('다른 번호로 카톡'));
  act(root,'hangup'); MK.markOpened(MK.ITEM.s5);
  act(root,'call-mom'); advance(1000);
  assert.ok(textOf(root).includes('엄마, 다른 번호로 카톡 보냈어?'));
  assert.ok(!textOf(root).includes('토크'));
});

test('청첩장 도착 전 축하 대사와 조건부 전화 선택지를 차단한다', () => {
  const {MK} = phoneEngine();
  for (const contact of MK.D.CONTACTS) for (const node of Object.values(contact.dialog.nodes)) {
    for (const choice of node.choices || []) if (choice.ifArrived) {
      assert.equal(MK.choiceAvailable(choice),false,choice.label);
      MK.S.delivered[choice.ifArrived]=true;
      if(choice.ifOpened){assert.equal(MK.choiceAvailable(choice),false,choice.label); MK.S.st[choice.ifOpened].opened=true;}
      assert.equal(MK.choiceAvailable(choice),true,choice.label);
      delete MK.S.delivered[choice.ifArrived];
    }
  }
});

test('사칭 대화의 인증번호는 별도 문자함으로 도착하고 대화에 섞이지 않는다', () => {
  const {MK, root, flush} = phoneEngine();
  MK.deliver(MK.ITEM.s5); MK.S.route={name:'thread',id:'k_s5'}; MK.ui.render();
  MK.replyChips('k_s5')[0].run();
  assert.equal(MK.S.delivered.A5,undefined);
  flush();
  assert.equal(MK.S.delivered.A5,true);
  assert.ok(!textOf(findNode(root, n => n.className && n.className.includes('kakao-thread'))).includes('482913'));
  MK.S.route={name:'thread',id:'auth_code'};MK.ui.render();
  assert.ok(textOf(root).includes('482913'));
});

test('카메라 확대값으로 이미지를 잘라 저장하고 같은 사진을 갤러리에서 연다', () => {
  const {MK, root, captures} = phoneEngine();
  MK.S.route={name:'app',app:'camera'};MK.ui.render();
  act(root,'camera-zoom-2');act(root,'shutter');
  assert.deepEqual(captures[0],[450,200,300,400,0,0,900,1200]);
  const thumb=findNode(root,n=>n.attrs&&n.attrs['data-act']==='camera-photos');
  assert.equal(findNode(thumb,n=>n.tag==='img').attrs.src,'data:image/jpeg;base64,LOCAL_CAPTURE');
  act(root,'camera-photos');act(root,'photo-0');
  assert.ok(findNode(root,n=>n.tag==='img'&&n.attrs.src==='data:image/jpeg;base64,LOCAL_CAPTURE'));
  act(root,'photo-favorite');
  assert.ok(textOf(root).includes('즐겨찾기 해제'));
});

test('X와 블로그는 서로 다른 사진·글·피드를 사용한다', () => {
  const {MK}=engine(); const x=MK.socialView('x'),blog=MK.socialView('blog');
  const images=n=>allNodes(n).filter(n=>n.tag==='img').map(n=>n.attrs.src);
  const xImages=new Set(images(x));
  assert.ok(images(blog).every(src=>!xImages.has(src)));
  assert.ok(textOf(x).includes('제 자리 주인이 바뀌었는데요'));
  assert.ok(textOf(blog).includes('회의를 30분 안에'));
  assert.ok(!textOf(x).includes('회의를 30분 안에'));
  act(x,'save-cat');assert.equal(MK.S.social.saved.cat,true);
  act(x,'comments-cat');act(x,'comment-reply-cat');assert.equal(MK.S.social.replies.cat,'좋은 하루 보내세요');
  act(blog,'neighbor-desk');assert.equal(MK.S.social.following.desk,true);
});

test('체크카드 내역은 아직 오지 않은 결제를 미리 보여주지 않고 분실신고도 시점에 맞춘다', () => {
  const {MK,root}=phoneEngine();
  MK.S.route={name:'app',app:'bank',tab:'history'};MK.ui.render();
  assert.ok(!textOf(root).includes('-12,000원'));
  MK.deliver(MK.ITEM.L8);assert.ok(textOf(root).includes('-12,000원'));
  MK.S.route={name:'app',app:'bank',tab:'lost'};MK.ui.render();
  act(root,'bank-report-lost');assert.equal(MK.S.tasks.t4,undefined);
  MK.deliver(MK.ITEM.s8);act(root,'bank-report-lost');
  assert.equal(MK.S.tasks.t4,true);assert.equal(MK.S.st.s8.verify,true);
});

test('견적서를 열어 확인한 뒤에만 이전 메일에 검토 회신을 보낼 수 있다', () => {
  const {MK,PCUI,root}=engine();
  MK.deliver(MK.ITEM.Lp2);MK.deliver(MK.ITEM.Lp11);
  MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  act(root,'desk-mail');act(root,'open-pm_partner');act(root,'reply-to-Lp2');
  assert.ok(textOf(root).includes('답장 대상: 11월 견적서 송부드립니다'));
  assert.ok(!textOf(root).includes('검토 후 회신 드립니다'));
  act(root,'att-open');assert.equal(MK.S.tasks.t1,undefined);
  assert.ok(textOf(root).includes('검토 후 회신 드립니다'));
  act(root,'reply');assert.equal(MK.S.tasks.t1,true);
});

test('이전 답장 뒤에 새 연락이 오면 대화 목록 미리보기도 새 연락을 가리킨다', () => {
  const {MK,flush}=phoneEngine();MK.deliver(MK.ITEM.A2);
  MK.ask('k_group',{label:'예약 확인할게',then:['네 고마워']},99);flush();
  assert.equal(MK.threadLast('k_group').text,'네 고마워');
  MK.deliver(MK.ITEM.A3);assert.equal(MK.threadLast('k_group').text,MK.ITEM.A3.body);
});


test('PC 카카오톡은 답장을 선택하면 즉시 보내고 별도 전송 단계를 만들지 않는다', () => {
  const {MK,PCUI,root}=engine();MK.deliver(MK.ITEM.Lp1);MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  act(root,'desk-chat');act(root,'open-pc_park');assert.equal(MK.S.timeline.pc_park.length,1);
  assert.ok(!textOf(root).includes('빠른 답장'));
  assert.ok(!findNode(root,n=>n.attrs&&n.attrs['data-act']==='chat-send'));
  const reply=findNode(root,n=>n.attrs&&n.attrs['data-act']==='reply');reply.click();
  assert.equal(MK.S.timeline.pc_park.length,2);assert.equal(MK.S.timeline.pc_park[1].text,'넵 알겠습니다');
  reply.click();assert.equal(MK.S.timeline.pc_park.length,2);
});

test('PC 카카오톡 차단·나가기는 상단 메뉴를 열었을 때만 표시된다', () => {
  const {MK,PCUI,root}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  act(root,'desk-chat');act(root,'open-pc_park');
  assert.ok(!findNode(root,n=>n.attrs&&n.attrs['data-act']==='report'));
  assert.ok(findNode(root,n=>n.className==='pc-chat-composer'));
  act(root,'pc-chat-menu');assert.ok(findNode(root,n=>n.attrs&&n.attrs['data-act']==='report'));
});

test('메일·Chrome은 투명 SVG, 카카오톡은 폰과 PC에서 같은 원본을 사용한다', () => {
  class IconNode {constructor(tag){this.tag=tag;this.attrs={};this.children=[];}setAttribute(k,v){this.attrs[k]=v;}appendChild(n){this.children.push(n);}}
  const ctx=vm.createContext({document:{createElement:tag=>new IconNode(tag),createElementNS:(_,tag)=>new IconNode(tag)}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/icons.js'),'utf8'),ctx);
  for(const [app,file] of [['mail','gmail-transparent.svg'],['browser','chrome.svg']]){
    const icon=ctx.MK_ICON(app,32,true,'desktop');assert.equal(icon.attrs.src,'assets/brands/'+file);
    const source=fs.readFileSync(path.join(__dirname,'../assets/brands',file),'utf8');
    assert.doesNotMatch(source,/<rect[^>]+(?:width="(?:100%|192|24)")[^>]+fill="(?:white|#fff(?:fff)?)"/i);
  }
  assert.equal(ctx.MK_ICON('talk',52,true).attrs.src,'assets/brands/kakao-app.png');
  assert.equal(ctx.MK_ICON('chat',32,true,'desktop').attrs.src,ctx.MK_ICON('talk',52,true).attrs.src);
});


test('쿠팡 상품 목록에서 상세·후기·장바구니·수량·주문서가 연결된다', () => {
  const {MK,root}=phoneEngine();MK.S.route={name:'app',app:'moamall'};MK.ui.render();
  const cards=allNodes(root).filter(n=>n.attrs&&/^product-/.test(n.attrs['data-act']||''));assert.equal(cards.length,9);
  act(root,'product-headphones');assert.ok(textOf(root).includes('오버이어 무선 헤드폰'));
  act(root,'product-reviews');assert.ok(textOf(root).includes('포장도 깔끔하게'));
  act(root,'add-cart');assert.equal(MK.S.shop.cart.headphones,1);
  act(root,'quantity-plus-headphones');assert.equal(MK.S.shop.cart.headphones,2);
  act(root,'shop-checkout');assert.ok(textOf(root).includes('109,800원'));assert.ok(textOf(root).includes('실제 결제는 진행되지 않는'));
});

test('상품 탐색만으로 확인 점수를 주지 않고 PC 고객센터의 해당 공지를 읽어야 확인된다', () => {
  const {MK,PCUI,root}=engine();MK.deliver(MK.ITEM.P6);MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  act(root,'desk-browser');clickNode(root,n=>n.tag==='button'&&n.textContent==='쿠팡');
  assert.equal(MK.S.st.P6.verify,false);act(root,'product-mouse');assert.equal(MK.S.st.P6.verify,false);
  act(root,'shop-notice');act(root,'notice-security');assert.equal(MK.S.st.P6.verify,true);
});

test('한빛상사는 제품 상세와 자료실을 제공하고 메일 요청으로 이어진다', () => {
  const {MK,PCUI,root}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  act(root,'desk-browser');clickNode(root,n=>n.tag==='button'&&n.textContent==='한빛상사');
  clickNode(root,n=>n.tag==='button'&&n.textContent==='제품안내');act(root,'company-product-keyboard');
  assert.ok(textOf(root).includes('수량별 견적 협의'));
  clickNode(root,n=>n.tag==='button'&&n.textContent==='자료실');assert.ok(textOf(root).includes('PDF 4MB'));
  clickNode(root,n=>n.tag==='button'&&n.textContent==='담당자에게 메일로 요청');assert.ok(textOf(root).includes('회사 소개서 보내주실 수 있을까요?'));
});

test('IT 확인 대화는 먼저 질문하고 발신 정보를 전달한 후에만 확인으로 기록한다', () => {
  const {MK,flush}=engine();MK.deliver(MK.ITEM.P3);
  assert.ok(!MK.replyChips('pc_it').some(ch=>ch.label.includes('발신 주소가')));
  MK.replyChips('pc_it')[0].run();assert.equal(MK.S.st.P3.verify,false);flush();
  const followup=MK.replyChips('pc_it').find(ch=>ch.label.includes('발신 주소가'));assert.ok(followup);followup.run();assert.equal(MK.S.st.P3.verify,true);
});

test('저장된 지인 프사와 기본 프사를 섞고 사칭 연락처에는 사진을 복제하지 않는다', () => {
  const {MK}=phoneEngine();assert.equal(MK.avatar('지수',true).tag,'img');assert.equal(MK.avatar('서연',true).tag,'img');
  assert.equal(MK.avatar('지수',false).tag,'span');assert.equal(MK.avatar('인사팀',true).tag,'span');
  assert.ok(MK.D.THREADS.k_yujin.history.length>=6);assert.ok(MK.D.THREADS.k_weekend.history.length>=4);
});

test('찜과 최근 본 상품을 유지하고 과거 주문의 배송 상태는 현재 니트와 분리한다', () => {
  const {MK,root}=phoneEngine();MK.S.route={name:'app',app:'moamall'};MK.ui.render();act(root,'product-mug');act(root,'save-product');
  assert.equal(MK.S.shop.saved.mug,true);act(root,'shop-saved');assert.ok(textOf(root).includes('세라믹 머그'));
  act(root,'shop-home');assert.ok(textOf(root).includes('최근 본 상품'));
  act(root,'shop-orders');act(root,'track-mug');assert.ok(textOf(root).includes('배송이 완료되었습니다'));
});


test('폰 카카오톡 하단은 친구·채팅·더보기 세 개이고 더보기에서 갤러리를 연다', () => {
  const {MK,root}=phoneEngine();MK.S.route={name:'app',app:'talk'};MK.ui.render();
  const nav=findNode(root,n=>n.className&&n.className.includes('kakao-bottom-nav'));
  assert.deepEqual(nav.children.map(n=>textOf(n)),['친구','채팅','더보기']);
  act(root,'talk-tab-friends');assert.ok(findNode(root,n=>n.className==='kakao-profile-row'));
  act(root,'talk-tab-more');act(root,'kakao-gallery');assert.ok(textOf(root).includes('갤러리'));assert.ok(findNode(root,n=>n.attrs&&n.attrs['data-act']==='gallery-albums'));
});

test('PC 카톡 미선택 영역은 로고 없이 비어 있고 친구·더보기에는 대화 영역이 없다', () => {
  const {MK,PCUI,root}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();act(root,'desk-chat');
  const empty=findNode(root,n=>n.className==='pc-chat-empty');assert.ok(empty);assert.equal(empty.children.length,0);assert.equal(empty.textContent,'');
  act(root,'open-pc_park');assert.ok(findNode(root,n=>n.className==='pane-read pc-chat-read'));
  for(const tab of ['friends','more']){act(root,'chat-tab-'+tab);assert.ok(!findNode(root,n=>n.className==='pane-read pc-chat-read'));assert.ok(!findNode(root,n=>n.className==='pc-chat-empty'));}
});

test('PC 갤러리는 사진 필터와 이미지 뷰어로 연결되고 X 바로가기는 없다', () => {
  const {MK,PCUI,root}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();act(root,'desk-gallery');
  assert.equal(allNodes(root).filter(n=>n.attrs&&/^gallery-photo-/.test(n.attrs['data-act']||'')).length,6);
  act(root,'gallery-filter-work');assert.equal(allNodes(root).filter(n=>n.attrs&&/^gallery-photo-/.test(n.attrs['data-act']||'')).length,2);
  act(root,'gallery-photo-0');assert.ok(findNode(root,n=>n.tag==='img'&&n.attrs.src==='assets/photos/friends.jpg'));
  act(root,'close');act(root,'desk-browser');assert.ok(!findNode(root,n=>n.attrs&&n.attrs['data-act']==='bm-x'));
});

test('회사 페이지의 로봇 확인창은 별도 오버레이로 열리고 다음 단계가 동작한다', () => {
  const {MK,PCUI,root}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();act(root,'desk-browser');clickNode(root,n=>n.tag==='button'&&n.textContent==='한빛상사');
  act(root,'clickfix');const overlay=findNode(root,n=>n.className==='cf-overlay');assert.ok(overlay);assert.ok(findNode(overlay,n=>n.className==='cf-box'));
  act(root,'cf-check');assert.ok(textOf(root).includes('Ctrl + V'));act(root,'cf-leave');assert.ok(!findNode(root,n=>n.className==='cf-overlay'));
});

test('주요 폰·PC 화면을 순회해 렌더링 예외와 빈 앱 진입을 점검한다', () => {
  const {MK,root}=phoneEngine();
  for(const [app,tab] of [['talk',null],['phone','contacts'],['photos',null],['photos','albums'],['bank',null],['bank','all'],['moamall',null],['moamall','orders'],['x',null],['blog',null],['settings',null],['map',null],['camera',null]]){
    MK.S.route={name:'app',app,tab};assert.doesNotThrow(()=>MK.ui.render(),app+':'+tab);assert.ok(root.children.length);
  }
  const pc=engine();pc.MK.ui=pc.PCUI;pc.PCUI.mount();pc.MK.S.running=true;pc.PCUI.render();
  for(const app of ['files','mail','chat','gallery','calendar','settings','browser'])assert.doesNotThrow(()=>act(pc.root,'tb-'+app),app);
});


test('PC에서 읽은 대화의 숫자는 즉시 사라지고 친구 탭에서 다른 메시지를 읽음 처리하지 않는다', () => {
  const {MK,PCUI,root}=engine();MK.deliver(MK.ITEM.Lp1);MK.deliver(MK.ITEM.Lp5);MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  act(root,'desk-chat');act(root,'open-pc_park');
  const row=findNode(root,n=>n.attrs&&n.attrs['data-act']==='open-pc_park');assert.ok(!findNode(row,n=>n.tag==='b'));assert.equal(MK.S.unread.Lp1,false);
  act(root,'chat-tab-friends');assert.equal(MK.S.unread.Lp5,true);assert.ok(!findNode(root,n=>n.className==='pc-chat-row-meta'));
});


test('회사 소개서는 저장만 해도 받기 완료, 견적서는 저장만으로 확인 완료되지 않는다', () => {
  const {MK,PCUI,root}=engine();MK.UI.pc=PCUI;MK.prepare('pc');MK.S.running=true;
  MK.deliver(MK.ITEM.Lp11);MK.ui.render();act(root,'tb-mail');act(root,'open-pm_partner');
  act(root,'att-save');assert.equal(MK.S.tasks.t3,true);
  MK.deliver(MK.ITEM.Lp2);MK.ui.render();
  const quoteAttachment=allNodes(root).find(n=>n.className==='attach' && textOf(n).includes('견적서'));
  const quoteSave=allNodes(quoteAttachment).find(n=>n.attrs && n.attrs['data-act']==='att-save');
  quoteSave.click();assert.equal(MK.S.taskSteps.quote_read,undefined);
});

for (const dev of ['phone','pc']) {
  test(dev+' 시작 즉시 끝낼 수 있고 진행도 바는 화면 전환 후에도 유지한다', () => {
    const e=engine(), {MK,root}=e;MK.UI[dev]=dev==='phone'?e.PhoneUI:e.PCUI;MK.prepare(dev);
    act(root,'start');
    const progress=findNode(root,n=>n.tag==='progress');
    assert.equal(progress.attrs.value,0);
    e.tick(1000);assert.equal(progress.attrs.value,1);
    act(root,dev==='phone'?'app-mail':'tb-mail');
    assert.equal(findNode(root,n=>n.tag==='progress'),progress);
    assert.equal(progress.attrs.max,MK.S.eventEndSec);
    act(root,'finish');assert.equal(MK.S.ended,true);
    assert.ok(textOf(root).includes('결과'));
  });
}

test('예약 알림은 모드별 간격과 종료 시간을 지킨다', () => {
  const {MK}=engine();
  for(const dev of ['phone','pc']) {
    MK.prepare(dev);
    const arrivals=MK.D.ITEMS.filter(it=>it.at!=null).sort((a,b)=>a.at-b.at);
    arrivals.forEach((it,i)=>{
      assert.ok(MK.S.schedule[it.id]>=it.at*1000);
      if(i)assert.ok(MK.S.schedule[it.id]-MK.S.schedule[arrivals[i-1].id]>=(MK.D.EVENT_GAP_SEC||18)*1000);
    });
    assert.ok(MK.S.schedule[arrivals.at(-1).id]<MK.D.RECOMMENDED_SEC*1000);
  }
});


test('피싱은 정상 연락의 맥락을 만든 뒤에 배치하고 PC 경고 뒤에도 이벤트가 이어진다', () => {
  const {MK}=engine();MK.prepare('phone');
  for(const [normal,fake] of [['L9','s1'],['L5','s5'],['L8','s8'],['L6','s6']])assert.ok(MK.S.schedule[normal]<MK.S.schedule[fake]);
  assert.ok(MK.S.schedule.s8<90000);
  assert.ok(MK.S.schedule.s8<MK.S.schedule.L1);
  MK.prepare('pc');
  for(const [normal,fake] of [['Lp2','P2'],['Lp3','P3'],['Lp6','P5'],['Lp7','P7'],['Lp9','P8']])assert.ok(MK.S.schedule[normal]<MK.S.schedule[fake]);
  assert.equal(MK.S.schedule.Lp1,0);
  assert.ok(MK.S.schedule.P4>=75000 && MK.S.schedule.P4<=105000);
  assert.ok(MK.S.schedule.Lp8-MK.S.schedule.P4>=60000);
});


test('휴대폰은 3분 안에 핵심 이벤트가 도착하고 피싱 사이는 16초 이상 확보한다', () => {
  const {MK}=engine();MK.prepare('phone');assert.equal(MK.D.RECOMMENDED_SEC,300);
  const phish=MK.D.ITEMS.filter(it=>it.kind==='phish' && it.at!=null).sort((a,b)=>a.at-b.at);
  assert.equal(phish.length,8);
  phish.forEach((it,i)=>{if(i)assert.ok(MK.S.schedule[it.id]-MK.S.schedule[phish[i-1].id]>=16000);});
  assert.ok(MK.S.schedule.s8<=164000);
  assert.deepEqual(MK.D.ITEMS.filter(it=>it.kind==='ambient' && it.at!=null).map(it=>it.id),['A2']);
});


test('휴대폰은 배송 안내로 시작하고 카드 분실은 중반, 지수 연락은 후반에 도착한다', () => {
  const e=engine(),{MK,root}=e;MK.UI.phone=e.PhoneUI;MK.prepare('phone');act(root,'start');
  e.tick(3000);assert.equal(MK.S.delivered.L2,true);assert.equal(MK.S.delivered.s4,undefined);
  e.tick(63000);assert.equal(MK.S.tasks.t4visible,true);assert.equal(MK.S.delivered.L1,undefined);
  assert.ok(MK.visibleTasks().some(task=>task.id==='t4'));assert.equal(MK.D.TASKS.at(-1).id,'t1');assert.equal(MK.D.TASKS.length,6);
});


test('갤럭시 하단의 홈·뒤로·최근 앱과 앱 재진입이 동작한다', () => {
  const {MK,root}=phoneEngine();act(root,'app-bank');act(root,'home');act(root,'recents');
  assert.ok(textOf(root).includes('최근 사용한 앱'));act(root,'recent-bank');assert.equal(MK.S.route.app,'bank');
  act(root,'system-back');assert.equal(MK.S.route.name,'recents');act(root,'home');assert.equal(MK.S.route.name,'home');
  const nav=findNode(root,n=>n.className==='system-navigation');assert.equal(nav.children.length,3);
});

test('추가 일상 미션은 단톡방 답장과 가족 통화 선택에 연결된다', () => {
  const {MK}=phoneEngine();MK.deliver(MK.ITEM.A2);MK.replyChips('k_group').find(ch=>ch.label.includes('강남역')).run();
  assert.equal(MK.S.tasks.t6,true);
  assert.ok(MK.ITEM.L5.dialog.nodes.b.choices.every(ch=>ch.task==='t5'));
  assert.ok(MK.D.CONTACTS.find(ct=>ct.key==='mom').dialog.nodes.a.choices.some(ch=>ch.task==='t5'));
});

test('PC 감염 팝업은 바탕화면에서도 나오며 업데이트 미션은 읽기와 실제 예약을 요구한다', () => {
  const {MK,PCUI,root}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  MK.deliver(MK.ITEM.P4);assert.equal(MK.S.delivered.P4,true);assert.equal(MK.S.st.P4.opened,true);
  assert.ok(findNode(root,n=>n.className==='scam-popup'));
  act(root,'popup-close');
  MK.deliver(MK.ITEM.Lp3);MK.markOpened(MK.ITEM.Lp3);assert.equal(MK.S.tasks.t5,undefined);
  MK.deliver(MK.ITEM.Lp4);clickNode(root,n=>n.tag==='button'&&n.textContent==='Windows 업데이트 열기');
  assert.ok(textOf(root).includes('재시작 필요'));assert.equal(MK.S.tasks.t5,undefined);
  act(root,'update');assert.equal(MK.S.tasks.t5,true);assert.ok(textOf(root).includes('오늘 22:00 재시작 예약됨'));
  MK.deliver(MK.ITEM.Lp7);
  clickNode(root,n=>n.attrs?.['data-act']==='toast-act' && n.textContent==='확인');
  act(root,'calendar-confirm');assert.equal(MK.S.tasks.t4,true);
});


for(const dev of ['phone','pc']) {
  test(dev+' 메모는 처음 한 개이며 15초마다 공개하고 연락 전에는 해당 미션을 숨긴다', () => {
    const e=engine(),{MK}=e;MK.UI[dev]=dev==='phone'?e.PhoneUI:e.PCUI;MK.prepare(dev);
    act(e.root,'start');assert.equal(MK.visibleTasks().length,1);
    e.tick(14750);assert.equal(MK.visibleTasks().length,1);e.tick(250);assert.equal(MK.visibleTasks().length,2);
    if(dev==='phone'){
      assert.ok(!MK.visibleTasks().some(t=>t.id==='t1'));assert.ok(!textOf(e.root).includes('연락 대기'));
    }
    const nav=findNode(e.root,n=>n.className==='system-navigation');
    if(nav)assert.ok(nav.children.every(button=>textOf(button)===''));
  });
  test(dev+' 예약 이벤트가 모두 도착하면 결과를 안내하고 5분이 지나도 강제로 종료하지 않는다', () => {
    const e=engine(),{MK}=e;MK.UI[dev]=dev==='phone'?e.PhoneUI:e.PCUI;MK.prepare(dev);act(e.root,'start');
    const scheduled=MK.D.ITEMS.filter(it=>it.at!=null).map(it=>it.id);
    assert.equal(MK.D.RECOMMENDED_SEC,300);
    for(let elapsed=250;elapsed<=180000;elapsed+=250){
      e.tick(250);
      if(dev==='pc' && elapsed===MK.S.schedule.P4) {
        assert.ok(findNode(e.root,n=>n.className==='scam-popup'));
        assert.ok(!MK.S.eventsDone);
        assert.ok(!MK.S.resultPrompt);
        act(e.root,'popup-close');
      }
      if(elapsed===MK.S.schedule[dev==='pc' ? 'Lp8' : 's3']){
        if(dev==='phone') assert.ok(textOf(e.root).includes(MK.cleanText(MK.ITEM.s3.body)));
        assert.ok(!MK.S.resultPrompt);
      }
      if(MK.S.eventsDone && elapsed < MK.S.eventsDoneAt+8000) assert.ok(!MK.S.resultPrompt);
    }
    assert.equal(MK.S.ended,false);assert.equal(MK.S.eventsDone,true);
    assert.ok(textOf(e.root).includes('결과를 확인할까요?'));
    assert.deepEqual(scheduled.filter(id=>!MK.S.delivered[id]),[]);
    if(dev==='phone') {
      act(e.root,'keep-playing');const time=MK.S.used;e.tick(301000);
      assert.equal(MK.S.used,time+301000);assert.equal(MK.S.resultPrompt,null);
      assert.equal(MK.S.ended,false);act(e.root,'finish');
    } else {
      act(e.root,'event-results');
    }
    assert.equal(MK.S.ended,true);
    assert.equal(MK.S.taskOrder.length,MK.D.TASKS.length);
  });
}


test('휴대폰에서는 방향과 관계없이 스마트폰 체험만 열리고 컴퓨터에서는 두 체험을 선택할 수 있다', () => {
  for(const portrait of [true,false]){
    const e=engine(),{MK,root}=e;e.setDevice(portrait,5,'Android');MK.prepare('pc');
    assert.ok(textOf(root).includes('스마트폰 일상 체험'));
    assert.ok(!findNode(root,n=>n.attrs['data-act']==='mode-pc'));
    assert.ok(textOf(root).includes('컴퓨터에서 접속하면 회사 PC 업무 체험도 할 수 있어요'));
    MK.UI.phone=e.PhoneUI;MK.prepare('phone');act(root,'start');act(root,'finish');
    assert.ok(!findNode(root,n=>n.attrs['data-act']==='other'));
  }
  const e=engine(),{MK,root}=e;MK.home();
  assert.ok(textOf(root).includes('스마트폰 일상 체험'));
  assert.ok(textOf(root).includes('회사 PC 업무 체험'));
  MK.UI.phone=e.PhoneUI;MK.prepare('phone');act(root,'start');act(root,'finish');
  act(root,'other');assert.equal(MK.dev,'pc');
});

test('변조된 자료실은 PDF 대신 별도 주소와 실행 감지를 표시하고 담당자가 변조를 확인한다', () => {
  const {MK,PCUI,root,flush}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();
  act(root,'desk-browser');clickNode(root,n=>n.tag==='button'&&n.textContent==='한빛상사');act(root,'clickfix');
  assert.ok(textOf(root).includes('files.hanbit-docs.example'));act(root,'cf-check');act(root,'expose');
  assert.equal(MK.S.st.P1.result,'exposed');assert.ok(textOf(root).includes('실행이 감지됐습니다'));assert.equal(MK.S.tasks.t3,undefined);
  act(root,'cf-leave');clickNode(root,n=>n.tag==='button'&&n.textContent==='담당자에게 메일로 요청');
  MK.replyChips('pm_partner').find(x=>x.label.includes('로봇 확인')).run();flush();
  assert.equal(MK.S.st.P1.verify,true);assert.ok(textOf(root).includes('다운로드 경로에 이상한 페이지'));
});

test('택배 기사에게 경비실을 선택하면 완료 문자와 배송 조회에 같은 장소가 나온다', () => {
  const e=phoneEngine(),{MK,root}=e;MK.deliver(MK.ITEM.L10);act(root,'answer');e.advance(1000);e.advance(1000);
  clickNode(root,n=>n.tag==='button'&&n.textContent==='경비실에 맡겨 주세요');
  MK.deliver(MK.ITEM.L3);assert.ok(MK.threadLast(MK.ITEM.L3.thread).text.includes('경비실에'));
  assert.ok(textOf(MK.shopView({surface:'phone',tab:'tracking:knit',onNavigate(){}})).includes('수령 장소: 경비실'));
});


test('브라우저 뒤로가기는 게임 안에서 이동하고 홈에서는 나갈지 확인한다', () => {
  const e=engine(),{MK,root}=e,h=e.installHistory();MK.UI.phone=e.PhoneUI;MK.prepare('phone');act(root,'start');
  assert.equal(h.length,2);act(root,'app-mail');h.back();assert.equal(MK.S.route.name,'home');assert.equal(h.length,2);
  h.back();assert.ok(textOf(root).includes('플레이를 그만할까요?'));const time=MK.S.used;e.tick(20000);assert.equal(MK.S.used,time);
  act(root,'stay');assert.ok(!MK.S.leavePrompt);assert.equal(h.state.mikkiphonePlaying,true);
  h.back();act(root,'leave');assert.equal(MK.S,null);assert.equal(h.state,null);assert.ok(textOf(root).includes('스마트폰 일상 체험'));
});

test('전체 화면은 버튼으로 열고 결과로 이동하면 해제한다', async () => {
  const e=engine(),{MK,root,document}=e;
  document.documentElement={requestFullscreen(){document.fullscreenElement=this;return Promise.resolve();}};
  document.exitFullscreen=()=>{document.fullscreenElement=null;return Promise.resolve();};
  MK.UI.phone=e.PhoneUI;MK.prepare('phone');act(root,'start');act(root,'fullscreen');await new Promise(resolve=>setImmediate(resolve));
  assert.ok(document.fullscreenElement);assert.equal(MK.S.fullscreenButton.attrs['aria-pressed'],'true');
  act(root,'finish');assert.equal(document.fullscreenElement,null);
});

test('전체 화면을 지원하지 않는 iPhone에는 웹 앱으로 여는 방법을 안내한다', () => {
  const e=engine(),{MK,root}=e;e.setDevice(true,5,'iPhone');MK.UI.phone=e.PhoneUI;MK.prepare('phone');act(root,'start');act(root,'fullscreen');
  assert.ok(textOf(root).includes('홈 화면에 추가 → 웹 앱으로 열기'));assert.equal(MK.S.ended,false);
});


test('PC 문서 미리보기는 내용 클릭과 바깥 클릭을 구분한다', () => {
  const {MK,PCUI,root}=engine();MK.ui=PCUI;PCUI.mount();MK.S.running=true;PCUI.render();act(root,'desk-doc');
  const layer=findNode(root,n=>n.className==='modal-back'),viewer=findNode(layer,n=>n.className==='modal viewer');
  layer.click({target:viewer,currentTarget:layer});assert.ok(findNode(root,n=>n.className==='modal viewer'));
  layer.click({target:layer,currentTarget:layer});assert.ok(!findNode(root,n=>n.className==='modal viewer'));
});

test('최근 앱 카드는 마지막 화면을 담고 위로 밀기와 모두 닫기를 지원한다', () => {
  const {MK,root}=phoneEngine();act(root,'app-mail');act(root,'home');act(root,'app-bank');act(root,'recents');
  assert.equal(allNodes(root).filter(n=>n.className==='recent-thumbnail').length,2);
  const preview=findNode(root,n=>n.className==='recent-thumbnail');assert.ok(Object.hasOwn(preview.children[0].attrs,'inert'));
  const bank=findNode(root,n=>n.attrs&&n.attrs['data-act']==='recent-bank');
  bank.pointerdown({clientX:70,clientY:140});bank.pointerup({clientX:72,clientY:55});
  assert.ok(!findNode(root,n=>n.attrs&&n.attrs['data-act']==='recent-bank'));
  act(root,'recent-clear');assert.equal(MK.S.route.name,'home');act(root,'recents');assert.ok(textOf(root).includes('최근 사용한 앱이 없어요'));
});
