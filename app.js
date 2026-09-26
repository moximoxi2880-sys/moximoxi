const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const heroes = [
  { id: "red", name: "红盾调查员", title: "复盘队长", color: "#b7352b", image: "assets/characters/mascot-red.png" },
  { id: "blue", name: "蜜桔小法", title: "法治宣传员", color: "#2d6f92", image: "assets/characters/mascot-blue.png" },
  { id: "green", name: "柿蒂阿婆", title: "邻里守望员", color: "#4d7f51", image: "assets/characters/mascot-green.png" },
  { id: "purple", name: "桃桃普法员", title: "风险核验员", color: "#8b5a8c", image: "assets/characters/mascot-purple.png" }
];

const trap = (name, icon, scene, penalty, caseId, clue) => ({
  name, icon, type: "trap", scene, penalty, caseId, clue,
  summary: `轻信并照做将扣除 ${penalty} 安全值；识别并拒绝则完成一次风险核验。`
});
const choice = (name, icon, scene, safeText, riskText, caseId, clue, safeFirst = true) => ({
  name, icon, type: "choice", scene, safeText, riskText, caseId, clue, safeFirst,
  summary: "在贴近乡村生活的情景中作出选择，安全方案奖励 8 点，冒险方案扣除 15 点。"
});
const safe = (name, icon, reward, lesson) => ({ name, icon, type: "safe", reward, lesson, summary: `完成安全实践，增加 ${reward} 点安全值。` });
const eventTile = (name, icon, deck = "reward") => ({
  name, icon, deck, type: "event",
  lesson: deck === "reward" ? "抽取一张平安奖励卡，获得调查助力。" : "抽取一张风险惩戒卡，应对突发骗局。",
  summary: deck === "reward" ? "抽取绿色平安奖励卡，并立即执行卡牌效果。" : "抽取红色风险惩戒卡，并立即执行卡牌效果。"
});
const special = (name, icon, kind, lesson, reward = 0) => ({ name, icon, type: "special", kind, lesson, reward, summary: lesson });

const tiles = [
  special("起点·马蹄岗复盘站", "🚩", "start", "经过或落到这里，复盘近期骗局并增加 10 点安全值。", 10),
  trap("百香果果园陷阱", "🥭", "陌生采购商声称高价包销百香果，但要求先付“渠道保证金”。", 24, "预付保证金", "先付款、后签约"),
  choice("蜜桔电商抉择", "🍊", "平台外“运营老师”称交保证金就能把蜜桔店铺推上首页。", "暂停付款，通过平台官方客服核验活动", "担心错过流量，立刻私下转保证金", "电商引流", "平台外收款"),
  safe("三二五红色安全驿站", "⭐", 12, "与同伴复盘：凡是催促转账的消息，都要换一个渠道核实身份。"),
  eventTile("大田油茶基地·平安卡", "🌿", "reward"),
  trap("农资化肥骗局", "🌾", "低价化肥广告承诺“内部渠道、货到丰收”，却要求向私人账户全款转账。", 28, "农资采购", "私人账户收款"),
  choice("客家乡村养老抉择", "🏠", "“养老服务专员”上门推销高息养老项目，催老人当天签约。", "联系家人并查询民政、市场监管等官方信息", "相信熟人介绍，当场签约付款", "养老投资", "高息养老项目"),
  safe("东江源便民服务点", "☎", 10, "通过官方窗口查询政策，不把验证码、银行卡密码告诉任何人。"),
  eventTile("古柏故里·风险卡", "🌳", "risk"),
  trap("短视频刷单陷阱", "📱", "短视频群里先返小额佣金，再诱导做大额“联单任务”。", 30, "刷单返利", "小利诱导大额投入"),
  special("三二五红色安全驿站", "★", "station", "重温调查方法：看来源、查身份、核账户、问家人。增加 15 点安全值。", 15),
  choice("农产品直播抉择", "🎥", "直播代运营公司保证“七天爆单”，要求绕开合同先交服务费。", "查验公司资质、合同与真实案例后再决定", "只看成交截图，马上转服务费", "直播代运营", "保证爆单"),
  eventTile("寻乌蜜桔产业园·平安卡", "🍊", "reward"),
  trap("冒充乡镇干部诈骗", "📄", "对方用干部头像发来“补贴申报表”，要求提供验证码并转认证费。", 35, "冒充公职人员", "索要验证码"),
  safe("乡村警务宣传栏", "🛡", 8, "记住：接到 96110 预警电话要及时接听，并按民警提示止付核验。"),
  choice("返乡青年网贷抉择", "💳", "贷款客服称银行卡号填错，需交“解冻金”才能放款。", "停止操作，通过持牌机构官方渠道查询", "继续借款交解冻金，想着到账后再还", "虚假网贷", "放款前收费"),
  eventTile("菖蒲会见旧址·风险卡", "🏛", "risk"),
  trap("冒充亲友 AI 换脸", "🎭", "视频中的“亲友”神情自然，却催你马上代转一笔急用款。", 32, "AI 换脸", "视频也要二次核验"),
  safe("百果满园合作社", "🤝", 11, "合作社建立双人复核：大额付款必须核合同、核账户、核收款人。"),
  choice("研学旅游项目抉择", "🚌", "陌生机构发来低价研学团链接，要求脱离平台缴纳定金。", "通过学校或文旅部门核验资质与合同", "被限时名额催促，点击链接直接付款", "虚假旅游", "脱离平台付款"),
  special("陷入骗局滞留区", "⏸", "detention", "正常移动落到这里仅为“路过参观”；只有连续三次对子或事件传送才会滞留。"),
  eventTile("圳下战斗旧址·平安卡", "📯", "reward"),
  safe("村新时代文明实践站", "📣", 13, "把典型骗局讲给邻里听，帮助身边人建立“先核验、后行动”的习惯。"),
  trap("虚假保险骗局", "☂", "“理赔专员”准确说出订单信息，要求共享屏幕办理快速赔付。", 26, "虚假理赔", "共享屏幕"),
  choice("果园投资抉择", "🌱", "项目方承诺“云认养果树、每月固定分红”，只展示精美宣传片。", "实地调查经营主体、收益来源和合同风险", "相信保本高收益，立即认购多棵果树", "虚假投资", "保本高收益"),
  eventTile("罗福嶂会议旧址·风险卡", "⛰", "risk"),
  safe("客家围屋议事点", "🏘", 9, "遇到拿不准的转账，先在家人、村干部或民警间进行多方核验。"),
  trap("快递理赔诈骗", "📦", "“快递客服”称包裹丢失，发来网页要求填写银行卡和短信验证码。", 25, "快递理赔", "陌生理赔链接"),
  choice("村集体分红抉择", "🧾", "群里通知“村集体分红升级”，扫码登记银行卡即可领钱。", "向村委会公开电话核实，不扫陌生二维码", "群里很多人说已领取，马上扫码登记", "冒充补贴", "群聊从众"),
  eventTile("澄江战斗旧址·平安卡", "🚩", "reward"),
  special("罗塘谈判·双面卡站", "🃏", "event", "谈判前先调查：随机抽取一张平安奖励卡或风险惩戒卡。"),
  safe("三二五红色安全驿站", "★", 14, "把“停止转账、保存证据、拨打官方电话”作为被骗后的止损三步。"),
  trap("冒充网络导师理财骗局", "📈", "群内“导师”晒出盈利截图，要求下载指定软件跟投数字资产。", 33, "虚假理财", "指定软件跟投"),
  choice("电商店铺抉择", "🛒", "客服称店铺违规，必须在十分钟内点击私聊链接缴纳解封费。", "从卖家后台进入官方申诉通道核验", "害怕封店，按私聊链接立即缴费", "冒充平台客服", "制造紧迫感"),
  eventTile("阳天茗茶茶园·风险卡", "🍵", "risk"),
  safe("乡镇便民服务中心", "🏢", 10, "补贴和政务事项只认官方渠道，不通过陌生链接提交账户信息。"),
  trap("“帮扶老区”慈善诈骗", "❤️", "自称公益组织人员募集“老区帮扶款”，收款码却是个人账户。", 27, "虚假慈善", "个人收款码"),
  choice("乡村交友杀猪盘抉择", "💬", "网恋对象每天嘘寒问暖，随后推荐“内部投资平台”共同赚钱。", "拒绝投资并向亲友、警方核验对方身份", "为了共同未来，跟随对方充值试试", "交友投资", "感情铺垫投资"),
  eventTile("百香果果社·平安卡", "🥭", "reward"),
  safe("果农夜校学习点", "📚", 12, "学习最新诈骗话术，把经验带回家庭和合作社。下一步将回到起点复盘。")
];

const rewardCards = [
  { title: "平安宣讲之星", text: "你在圩日集市讲清养老骗局，老人们记住了“不轻信、不转账”。", icon: "📣", effect: "safety", amount: 15, label: "安全值 +15" },
  { title: "96110 及时止付", text: "你接听预警电话并配合核验，守住了准备转出的资金。", icon: "☎", effect: "shield", amount: 1, label: "获得 1 枚守护盾" },
  { title: "寻乌调查研学", text: "你用实事求是的方法核对来源、身份和账户，找到关键破绽。", icon: "🔎", effect: "clue", amount: 1, label: "调查线索 +1" },
  { title: "蜜桔合作社联防", text: "合作社建立大额付款双人复核，大家互相提醒。", icon: "🍊", effect: "safety", amount: 12, label: "安全值 +12" },
  { title: "校园反诈小课堂", text: "你识破游戏充值低价代充骗局，并把案例讲给同学。", icon: "🎮", effect: "extra", label: "获得 1 次额外行动" },
  { title: "邻里守望", text: "你帮助独居老人核验陌生来电，获得一枚多方核验章。", icon: "🏠", effect: "stamp", amount: 1, label: "核验章 +1，安全值 +5" },
  { title: "官方平台核验", text: "你从官方入口核对助农补贴，没有点击群里的陌生链接。", icon: "🛡", effect: "safety", amount: 10, label: "安全值 +10" },
  { title: "保留完整证据", text: "你及时保存聊天与转账信息，为止付追查赢得时间。", icon: "🧾", effect: "shield", amount: 1, label: "获得 1 枚守护盾" },
  { title: "家人视频暗号", text: "全家约定转账前核对暗号，AI 换脸也骗不过你。", icon: "🎭", effect: "clue", amount: 1, label: "调查线索 +1" },
  { title: "警民反诈服务站", text: "你完成风险复盘，若求助卡已经使用，可重新领取一张。", icon: "👮", effect: "rescue", label: "补充 96110 求助卡" },
  { title: "果园实地核查", text: "你没有相信“云认养”宣传片，而是实地查看经营主体。", icon: "🌱", effect: "move", amount: 2, label: "沿路线前进 2 格" },
  { title: "法治赶集日", text: "反诈摊位人气满满，你答对三道风险辨识题。", icon: "⚖", effect: "safety", amount: 18, label: "安全值 +18" }
];

const riskCards = [
  { title: "养老项目限时返利", text: "所谓养老服务专员用高息和赠品催促老人当天付款。", icon: "🧓", effect: "safety", amount: -18, caseId: "养老投资", label: "安全值 -18" },
  { title: "AI 亲友紧急借款", text: "视频里的人像亲友，却拒绝回答你们约定的核验问题。", icon: "🎭", effect: "safety", amount: -20, caseId: "AI 换脸", label: "安全值 -20" },
  { title: "游戏装备低价代充", text: "陌生卖家让你脱离平台扫码充值，付款后立即失联。", icon: "🎮", effect: "safety", amount: -16, caseId: "游戏充值", label: "安全值 -16" },
  { title: "刷单连环任务", text: "小额返利后出现必须连续完成的大额任务，你被拖住了。", icon: "📱", effect: "skip", amount: 1, caseId: "刷单返利", label: "暂停行动 1 回合" },
  { title: "虚假蜜桔采购单", text: "高价采购商索要渠道保证金，你需要退回核验来源。", icon: "🍊", effect: "move", amount: -3, caseId: "预付保证金", label: "沿路线后退 3 格" },
  { title: "冒充干部发补贴", text: "对方索取银行卡验证码，造成信息风险。", icon: "📄", effect: "clue", amount: -1, caseId: "冒充补贴", label: "调查线索 -1" },
  { title: "共享屏幕理赔", text: "假客服诱导共享屏幕，你的验证码暴露。", icon: "📦", effect: "safety", amount: -22, caseId: "虚假理赔", label: "安全值 -22" },
  { title: "理财导师拉群", text: "群里的盈利截图全是布置好的，你被带离正规渠道。", icon: "📈", effect: "safety", amount: -20, caseId: "虚假理财", label: "安全值 -20" },
  { title: "陌生链接木马", text: "你点开所谓助农文件，设备需要停下来进行安全检查。", icon: "🔗", effect: "skip", amount: 1, caseId: "钓鱼链接", label: "暂停行动 1 回合" },
  { title: "网贷解冻金", text: "放款前收费是典型红旗信号，你的调查进度受到干扰。", icon: "💳", effect: "clue", amount: -1, caseId: "虚假网贷", label: "调查线索 -1" },
  { title: "感情投资局", text: "网恋对象推荐内部平台，你偏离调查路线。", icon: "💬", effect: "move", amount: -2, caseId: "交友投资", label: "沿路线后退 2 格" },
  { title: "特产加盟骗局", text: "“全国总代”收完加盟费失联，风险值骤升。", icon: "🛍", effect: "safety", amount: -17, caseId: "微商加盟", label: "安全值 -17" }
];

const perimeter = (() => {
  const result = [[11, 1]];
  for (let c = 2; c <= 11; c++) result.push([11, c]);
  for (let r = 10; r >= 1; r--) result.push([r, 11]);
  for (let c = 10; c >= 1; c--) result.push([1, c]);
  for (let r = 2; r <= 10; r++) result.push([r, 1]);
  return result;
})();

const state = {
  started: false, finished: false, mode: "standard", players: [], current: 0, round: 1,
  phase: "setup", doublesStreak: 0, extraRoll: false, selectedHeroes: new Set(["red", "blue"]),
  cases: new Set(), logs: [], secondsLeft: 28 * 60, timer: null, tilt: 34, topView: false,
  sound: true, modalLocked: false, modalContinue: null, rewardIndex: 0, riskIndex: 0, mixedDeck: "reward"
};

function buildBoard() {
  tiles.forEach((tile, index) => {
    const [row, column] = perimeter[index];
    const cell = document.createElement("button");
    const specialClass = index === 0 ? "start" : `${tile.type}${tile.type === "event" ? ` card-${tile.deck}` : ""}`;
    cell.type = "button";
    cell.className = `cell ${specialClass}`;
    cell.dataset.index = index;
    cell.style.gridArea = `${row} / ${column}`;
    cell.setAttribute("aria-label", `第 ${index + 1} 格，${tile.name}`);
    cell.innerHTML = `<span class="cell-num">${String(index + 1).padStart(2, "0")}</span><span class="cell-icon">${tile.icon}</span><span class="cell-name">${tile.name}</span><span class="cell-badge">${tile.type === "trap" ? "诈" : tile.type === "choice" ? "择" : tile.type === "event" ? tile.deck === "reward" ? "奖" : "惩" : ""}</span>`;
    cell.addEventListener("click", () => previewTile(index));
    $("#board").append(cell);
  });
  heroes.forEach((hero, index) => {
    const pawn = document.createElement("div");
    pawn.className = "pawn";
    pawn.id = `pawn-${hero.id}`;
    pawn.style.setProperty("--pawn-offset-x", `${(index % 2) * 18 - 9}px`);
    pawn.style.setProperty("--pawn-offset-y", `${Math.floor(index / 2) * 15 - 8}px`);
    pawn.innerHTML = `<img src="${hero.image}" alt="" />`;
    pawn.hidden = true;
    $("#board").append(pawn);
  });
}

function buildSetup() {
  const root = $("#characterOptions");
  heroes.forEach(hero => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "character-option selected";
    button.dataset.hero = hero.id;
    button.innerHTML = `<i>✓</i><img src="${hero.image}" alt="" /><b>${hero.name}</b><span>${hero.title}</span>`;
    if (!state.selectedHeroes.has(hero.id)) button.classList.remove("selected");
    button.addEventListener("click", () => {
      if (state.selectedHeroes.has(hero.id)) {
        if (state.selectedHeroes.size <= 2) return toast("至少需要两位玩家");
        state.selectedHeroes.delete(hero.id);
      } else {
        state.selectedHeroes.add(hero.id);
      }
      buildSetupSelection();
    });
    root.append(button);
  });
}

function buildSetupSelection() {
  $$(".character-option").forEach(button => {
    const selected = state.selectedHeroes.has(button.dataset.hero);
    button.classList.toggle("selected", selected);
    $("i", button).textContent = selected ? "✓" : "+";
  });
}

function tileCategory(tile, index) {
  if ([0, 10, 20, 30].includes(index)) return "四角地标";
  if (tile.type === "event") return tile.deck === "reward" ? "平安奖励卡格" : "风险惩戒卡格";
  return { safe: "安全实践格", trap: "诈骗陷阱格", choice: "情景抉择格", special: "特殊格" }[tile.type];
}

function previewTile(index) {
  if (!$("#modalOverlay").hidden || !$("#setupOverlay").hidden) return;
  const tile = tiles[index];
  showModal({
    icon: tile.icon, type: `第 ${index + 1} 格 · ${tileCategory(tile, index)}`, title: tile.name,
    location: "棋格预览 · 点击棋盘上的其他格子也可查看",
    body: `<p>${tile.scene || tile.lesson || tile.summary}</p><div class="quote">${tile.summary}</div>`,
    choices: [], locked: false, continueText: "返回棋盘"
  });
}

function startGame() {
  state.players = heroes.filter(hero => state.selectedHeroes.has(hero.id)).map(hero => ({
    hero, safety: 100, position: 0, rescue: true, clues: 0, stamps: 0, shields: 0, skipTurns: 0, detained: false, eliminated: false
  }));
  state.started = true;
  state.finished = false;
  state.current = Math.floor(Math.random() * state.players.length);
  state.round = 1;
  state.phase = "roll";
  state.doublesStreak = 0;
  state.extraRoll = false;
  state.cases = new Set();
  state.logs = [];
  state.secondsLeft = 28 * 60;
  state.rewardIndex = Math.floor(Math.random() * rewardCards.length);
  state.riskIndex = Math.floor(Math.random() * riskCards.length);
  state.mixedDeck = Math.random() > .5 ? "reward" : "risk";
  $("#setupOverlay").hidden = true;
  addLog(`抽签结果：${currentPlayer().hero.name}先行`);
  addLog(`调查队已集结，共 ${state.players.length} 人`);
  if (state.timer) clearInterval(state.timer);
  if (state.mode === "timed") {
    state.timer = setInterval(() => {
      if (!state.started || state.finished) return;
      state.secondsLeft--;
      updateTimer();
      if (state.secondsLeft <= 0) endGame("time");
    }, 1000);
  }
  render();
  beginTurn();
  toast(`${currentPlayer().hero.name}先行，调查队出发！`);
  tone(520, .1);
}

function currentPlayer() { return state.players[state.current]; }

function render() {
  renderPawns();
  renderPlayers();
  renderCurrent();
  renderCases();
  updateTimer();
  $("#roundLabel").textContent = state.started ? `第 ${state.round} 轮 · ${state.phase === "moving" ? "移动中" : state.phase === "resolve" ? "处理事件" : "行动中"}` : "等待开局";
  $("#modeLabel").textContent = state.mode === "standard" ? "标准淘汰模式" : "28 分钟活动模式";
  $("#rollButton").disabled = !state.started || state.finished || state.phase !== "roll" || Boolean(currentPlayer()?.detained);
}

function renderPawns() {
  heroes.forEach(hero => {
    const pawn = $(`#pawn-${hero.id}`);
    const playerIndex = state.players.findIndex(player => player.hero.id === hero.id);
    if (playerIndex < 0) {
      pawn.hidden = true;
      return;
    }
    const player = state.players[playerIndex];
    const [row, column] = perimeter[player.position];
    pawn.hidden = false;
    pawn.style.left = `calc(${((column - .5) / 11) * 100}% + 0px)`;
    pawn.style.top = `calc(${((row - .5) / 11) * 100}% + 0px)`;
    pawn.classList.toggle("current", playerIndex === state.current && !state.finished);
    pawn.classList.toggle("eliminated", player.eliminated);
  });
  $$(".cell").forEach((cell, index) => cell.classList.toggle("active-cell", Boolean(state.started && currentPlayer()?.position === index)));
}

function renderPlayers() {
  const list = $("#playersList");
  list.replaceChildren();
  state.players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = `player-row ${index === state.current && !state.finished ? "current" : ""} ${player.eliminated ? "out" : ""}`;
    row.style.setProperty("--player-color", player.hero.color);
    const status = player.eliminated ? "已退出对局" : player.detained ? "滞留中" : `第 ${player.position + 1} 格 · 线索 ${player.clues}`;
    row.innerHTML = `<img src="${player.hero.image}" alt="" /><div><b>${player.hero.name}</b><small>${status}</small></div><div class="player-score">${player.safety}<small>安全值</small></div>`;
    list.append(row);
  });
}

function renderCurrent() {
  const player = currentPlayer();
  if (!player) return;
  $("#turnAvatar").src = player.hero.image;
  $("#turnAvatar").alt = player.hero.name;
  $("#turnName").textContent = player.hero.name;
  $("#turnMeta").textContent = player.detained ? "陷入骗局滞留，选择解除方式" : `位于第 ${player.position + 1} 格 · ${tiles[player.position].name}`;
  $("#turnSafety").textContent = player.safety;
  $("#safetyBar").style.width = `${Math.max(0, Math.min(100, player.safety))}%`;
  $("#rescueStatus").textContent = `☎ 96110 × ${player.rescue ? 1 : 0}`;
  $("#clueStatus").textContent = `◆ 调查线索 × ${player.clues}`;
  $("#stampStatus").textContent = `章 多方核验 × ${player.stamps}`;
  $("#shieldStatus").textContent = `盾 守护盾 × ${player.shields}`;
  $("#turnCard").style.background = `linear-gradient(140deg, ${player.hero.color}, #102a43)`;
}

function renderCases() {
  const count = Math.min(8, state.cases.size);
  $("#caseCount").textContent = `${count} / 8`;
  $("#centerCaseCount").textContent = `${count} / 8`;
  $("#caseProgress").style.width = `${count / 8 * 100}%`;
  $("#caseHint").textContent = count >= 8 ? "调查簿已完成：你已识别八类高发骗局。" : count ? `已识破：${[...state.cases].slice(-3).join("、")}` : "识破不同类型的骗局，完善调查簿。";
}

function updateTimer() {
  if (state.mode !== "timed") return $("#timerLabel").textContent = "不限时";
  const min = String(Math.floor(state.secondsLeft / 60)).padStart(2, "0");
  const sec = String(state.secondsLeft % 60).padStart(2, "0");
  $("#timerLabel").textContent = `${min}:${sec}`;
}

function beginTurn() {
  if (state.finished) return;
  const player = currentPlayer();
  if (player.skipTurns > 0) {
    player.skipTurns--;
    state.phase = "skipped";
    $("#detentionActions").hidden = true;
    $("#rollButton").hidden = false;
    addLog(`${player.hero.name}执行风险惩戒，暂停行动 1 回合`);
    render();
    showModal({
      icon: "⏳", type: "风险惩戒生效", title: "冷静核验，暂停行动",
      location: `${player.hero.name} · 本回合不能掷骰`,
      body: "<div class='fortune-card risk-card'><span>风险惩戒卡</span><strong>暂停一回合</strong><p>利用这一回合检查设备、保存证据并通过官方渠道核验。</p><em>沉着不是耽误，而是止损。</em></div>",
      choices: [], locked: true, cardType: "risk", continueText: "完成核验，交给下一位", onContinue: () => { closeModal(); nextTurn(); }
    });
    return;
  }
  state.phase = player.detained ? "detained" : "roll";
  state.extraRoll = false;
  state.doublesStreak = 0;
  $("#detentionActions").hidden = !player.detained;
  $("#useRescueButton").disabled = !player.rescue;
  $("#rollButton").hidden = player.detained;
  $("#turnPrompt").textContent = player.detained
    ? "本回合不能掷骰：等待一回合，或消耗 96110 求助卡立即解除。"
    : `${player.hero.name}，掷出双骰沿棋盘顺时针调查。`;
  render();
}

async function rollDice() {
  if (state.phase !== "roll" || state.finished) return;
  state.phase = "rolling";
  render();
  const d1 = Math.ceil(Math.random() * 6);
  const d2 = Math.ceil(Math.random() * 6);
  $(".die", $("#dieOne"))?.classList?.add("rolling");
  $("#dieOne").classList.add("rolling");
  $("#dieTwo").classList.add("rolling");
  tone(260, .07);
  await wait(720);
  $("#dieOne").classList.remove("rolling");
  $("#dieTwo").classList.remove("rolling");
  $("#dieOne span").textContent = "⚀⚁⚂⚃⚄⚅"[d1 - 1];
  $("#dieTwo span").textContent = "⚀⚁⚂⚃⚄⚅"[d2 - 1];
  const doubles = d1 === d2;
  state.extraRoll = doubles;
  state.doublesStreak = doubles ? state.doublesStreak + 1 : 0;
  addLog(`${currentPlayer().hero.name}掷出 ${d1}+${d2}${doubles ? "（对子）" : ""}`);
  if (state.doublesStreak >= 3) {
    state.extraRoll = false;
    currentPlayer().position = 20;
    currentPlayer().detained = true;
    render();
    addLog(`${currentPlayer().hero.name}连续三次对子，进入滞留区`);
    showModal({
      icon: "⏸", type: "特殊状态", title: "连续三次对子：陷入骗局滞留",
      location: "直接传送到第 21 格 · 本次不经过起点",
      body: "<p>连续的顺利容易让人放松警惕。你被模拟骗局的话术困住，本回合立即结束。</p><div class='quote'>下次轮到你时，可等待一回合，或使用 96110 求助卡立即解除。</div>",
      choices: [], locked: true, continueText: "结束本回合", onContinue: nextTurn
    });
    return;
  }
  await movePlayer(d1 + d2);
}

async function movePlayer(steps) {
  state.phase = "moving";
  $("#turnPrompt").textContent = `前进 ${steps} 格，沿途留意风险信号……`;
  render();
  const player = currentPlayer();
  for (let step = 0; step < steps; step++) {
    player.position = (player.position + 1) % tiles.length;
    if (player.position === 0) {
      player.safety += 10;
      addLog(`${player.hero.name}经过马蹄岗复盘站，安全值 +10`);
      tone(620, .05);
    }
    renderPawns();
    renderCurrent();
    await wait(125);
  }
  state.phase = "resolve";
  render();
  resolveTile(player.position);
}

function resolveTile(index) {
  const tile = tiles[index];
  const player = currentPlayer();
  const location = `第 ${index + 1} 格 · ${tileCategory(tile, index)}`;
  if (tile.type === "safe" || (tile.type === "special" && ["start", "station"].includes(tile.kind))) {
    const reward = index === 0 ? 0 : tile.reward;
    if (reward) player.safety += reward;
    addLog(`${player.hero.name}抵达${tile.name}${reward ? `，安全值 +${reward}` : ""}`);
    tone(560, .12);
    showModal({
      icon: tile.icon, type: "安全实践", title: tile.name, location,
      body: `<p>${tile.lesson}</p><div class="quote">${reward ? `安全值 +${reward}` : "完成一轮复盘，继续保持警惕。"}</div>`,
      choices: [], locked: true, continueText: turnContinueText(), onContinue: finishResolution
    });
    return render();
  }
  if (tile.type === "trap") return openTrap(tile, location);
  if (tile.type === "choice") return openChoice(tile, location);
  if (tile.type === "event" || (tile.type === "special" && tile.kind === "event")) return drawEvent(location, tile.deck || "mixed");
  if (tile.kind === "detention") {
    addLog(`${player.hero.name}路过滞留区，不受处罚`);
    showModal({
      icon: tile.icon, type: "路过参观", title: tile.name, location,
      body: `<p>${tile.lesson}</p><div class="quote">这次是正常落格，不属于滞留状态，下回合照常行动。</div>`,
      choices: [], locked: true, continueText: turnContinueText(), onContinue: finishResolution
    });
  }
}

function openTrap(tile, location) {
  showModal({
    icon: tile.icon, type: "诈骗陷阱", title: tile.name, location,
    body: `<div class="quote">“${tile.scene}”</div><div class="clue-callout"><span>停：不要被催促</span><span>查：核验身份与账户</span><span>问：联系官方或亲友</span></div>`,
    locked: true,
    choices: [
      { label: "A", text: "相信对方说法并按要求操作", sub: `可能损失 ${tile.penalty} 安全值`, action: () => resolveDecision(false, -tile.penalty, tile) },
      { label: "B", text: "停止操作，通过官方渠道多方核验", sub: "心理成本 -5，识骗奖励 +5，净变化 0", action: () => resolveDecision(true, 0, tile) }
    ]
  });
}

function openChoice(tile, location) {
  const good = { label: tile.safeFirst ? "A" : "B", text: tile.safeText, sub: "安全值 +8，并获得 1 条调查线索", action: () => resolveDecision(true, 8, tile) };
  const bad = { label: tile.safeFirst ? "B" : "A", text: tile.riskText, sub: "安全值 -15", action: () => resolveDecision(false, -15, tile) };
  showModal({
    icon: tile.icon, type: "情景抉择", title: tile.name, location,
    body: `<div class="quote">“${tile.scene}”</div><p>没有死记硬背的标准口号，请根据可核验的信息作出选择。</p>`,
    locked: true, choices: tile.safeFirst ? [good, bad] : [bad, good]
  });
}

function resolveDecision(good, delta, tile) {
  disableChoices(good);
  const player = currentPlayer();
  if (good) {
    if (delta) player.safety += delta;
    addClue(player);
    state.cases.add(tile.caseId);
    addLog(`${player.hero.name}识破“${tile.caseId}”${delta ? `，安全值 +${delta}` : ""}`);
    showFeedback(true, `识别成功：${tile.clue}`, `你抓住了“${tile.clue}”这一风险信号。先停、再查、后行动，比凭感觉更可靠。`);
    tone(640, .12);
    prepareContinue();
  } else {
    addLog(`${player.hero.name}在“${tile.caseId}”情景中承担风险`);
    showFeedback(false, "风险发生", `诈骗常利用信任、紧迫感和高收益诱惑。此次将影响 ${Math.abs(delta)} 点安全值。`);
    applyImpact(delta, tile.caseId, prepareContinue);
  }
  render();
}

function drawEvent(location, requestedDeck = "mixed") {
  const deckType = requestedDeck === "mixed" ? state.mixedDeck : requestedDeck;
  if (requestedDeck === "mixed") state.mixedDeck = deckType === "reward" ? "risk" : "reward";
  const deck = deckType === "reward" ? rewardCards : riskCards;
  const indexKey = deckType === "reward" ? "rewardIndex" : "riskIndex";
  const card = deck[state[indexKey] % deck.length];
  state[indexKey] = (state[indexKey] + 5) % deck.length;
  const cardName = deckType === "reward" ? "平安奖励卡" : "风险惩戒卡";
  showModal({
    icon: card.icon, type: cardName, title: card.title, location,
    body: `<div class="fortune-card ${deckType}-card"><span>${cardName}</span><strong>${card.title}</strong><p>${card.text}</p><em>${card.label}</em></div>`,
    choices: [], locked: true, cardType: deckType
  });
  applyCardEffect(card, deckType);
  render();
}

function applyCardEffect(card, deckType) {
  const player = currentPlayer();
  addLog(`${player.hero.name}抽到${deckType === "reward" ? "平安奖励卡" : "风险惩戒卡"}“${card.title}”`);
  if (deckType === "risk" && player.shields > 0) {
    player.shields--;
    addLog(`${player.hero.name}使用守护盾，抵消“${card.title}”`);
    showFeedback(true, "守护盾生效", "此前积累的防骗准备抵消了本次风险惩戒，卡牌效果不再执行。");
    tone(720, .15);
    prepareContinue();
    return;
  }
  if (card.effect === "safety") {
    if (card.amount > 0) {
      player.safety += card.amount;
      addLog(`${player.hero.name}安全值 +${card.amount}`);
      tone(590, .12);
      prepareContinue();
    } else {
      applyImpact(card.amount, card.caseId, prepareContinue);
    }
    return;
  }
  if (card.effect === "clue") {
    if (card.amount > 0) addClue(player);
    else player.clues = Math.max(0, player.clues + card.amount);
  }
  if (card.effect === "stamp") {
    player.stamps += card.amount;
    player.safety += 5;
  }
  if (card.effect === "shield") player.shields += card.amount;
  if (card.effect === "rescue") {
    if (player.rescue) {
      player.safety += 8;
      card = { ...card, label: "求助卡已持有，改为安全值 +8" };
      showFeedback(true, "奖励自动兑换", "你已经持有 96110 求助卡，本次奖励自动兑换为 8 点安全值。");
    } else player.rescue = true;
  }
  if (card.effect === "extra") state.extraRoll = true;
  if (card.effect === "skip") player.skipTurns += card.amount;
  if (card.effect === "move") {
    const oldPosition = player.position;
    player.position = (player.position + card.amount + tiles.length) % tiles.length;
    if (card.amount > 0 && oldPosition + card.amount >= tiles.length) {
      player.safety += 10;
      addLog(`${player.hero.name}经过马蹄岗复盘站，安全值 +10`);
    }
  }
  addLog(`${player.hero.name}执行卡牌效果：${card.label}`);
  tone(deckType === "reward" ? 620 : 220, .13);
  prepareContinue();
}

function addClue(player) {
  player.clues++;
  if (player.clues % 3 === 0) {
    player.stamps++;
    player.safety += 5;
    addLog(`${player.hero.name}集齐 3 条线索，获得多方核验章和 5 点安全值`);
    toast("集齐 3 条线索：多方核验章 +1，安全值 +5");
  }
}

function applyImpact(delta, reason, done) {
  const player = currentPlayer();
  if (delta <= -20 && player.rescue) {
    $("#feedback").hidden = false;
    $("#feedback").className = "feedback loss";
    $("#feedback").innerHTML = `<strong>96110 求助卡可以生效</strong>这次扣分达到 20 点。请在损失结算前决定是否使用；每人整局仅有一次。`;
    const choices = $("#choiceList");
    choices.replaceChildren();
    choices.append(
      makeChoice({ label: "☎", text: "立即使用 96110 求助卡", sub: "抵消本次全部扣分，卡牌消耗", action: () => {
        player.rescue = false;
        addLog(`${player.hero.name}使用 96110 求助卡，抵消“${reason}”损失`);
        disableChoices(true);
        showFeedback(true, "预警止损成功", "你在扣分生效前及时求助，避免了本次全部损失。");
        tone(720, .16);
        done();
        render();
      }}),
      makeChoice({ label: "!", text: "保留求助卡，承担本次后果", sub: `安全值 ${delta}`, action: () => {
        disableChoices(false);
        settleDelta(delta, reason);
        done();
      }})
    );
    return;
  }
  settleDelta(delta, reason);
  done();
}

function settleDelta(delta, reason) {
  const player = currentPlayer();
  player.safety += delta;
  addLog(`${player.hero.name}因“${reason}”安全值 ${delta}`);
  if (player.safety <= 0) {
    player.eliminated = true;
    addLog(`${player.hero.name}安全值归零，退出对局`);
    showFeedback(false, "本局遭受财产损失", "安全值已归零，本角色退出当前对局。反诈知识不等于永远不会踩坑，复盘和求助同样重要。");
  }
  tone(180, .18);
  render();
}

function prepareContinue() {
  $("#continueButton").hidden = false;
  $("#continueButton").textContent = turnContinueText();
  state.modalContinue = finishResolution;
}

function turnContinueText() { return state.extraRoll ? "对子！处理完毕后再掷一次" : "完成处理，交给下一位"; }

function finishResolution() {
  closeModal();
  render();
  if (!state.players.some(player => !player.eliminated)) {
    endGame("none");
    return;
  }
  if (checkStandardWinner()) return;
  if (currentPlayer().eliminated) return nextTurn();
  if (state.extraRoll) {
    state.phase = "roll";
    $("#turnPrompt").textContent = "掷出对子：完成当前格效果后，可以再掷一次。";
    render();
    return;
  }
  nextTurn();
}

function nextTurn() {
  if (state.finished) return;
  const previous = state.current;
  let next = previous;
  do next = (next + 1) % state.players.length;
  while (state.players[next].eliminated && next !== previous);
  if (next <= previous) state.round++;
  state.current = next;
  beginTurn();
}

function checkStandardWinner() {
  if (state.mode !== "standard") return false;
  const alive = state.players.filter(player => !player.eliminated);
  if (alive.length > 1) return false;
  endGame("last");
  return true;
}

function endGame(reason) {
  if (state.finished) return;
  state.finished = true;
  state.phase = "finished";
  if (state.timer) clearInterval(state.timer);
  const active = state.players.filter(player => !player.eliminated);
  const rankingPool = active.length ? active : state.players;
  const highest = Math.max(...rankingPool.map(player => player.safety));
  const winners = rankingPool.filter(player => player.safety === highest);
  const title = winners.map(player => player.hero.name).join("、");
  addLog(reason === "time" ? "28 分钟活动时间结束" : "标准模式决出最后留场者");
  showModal({
    icon: "🏆", type: "本局结算", title: `${title}获胜`,
    location: reason === "time" ? "活动模式 · 按当前安全值结算" : "标准模式 · 最后留在场上的调查员",
    body: `<p>最高安全值：<b>${highest}</b>。本局共识破 ${state.cases.size} 类骗局。</p><div class="quote">真正的胜利，是把“停一停、查一查、问一问”带回生活。</div>`,
    choices: [], locked: true, continueText: "查看最终棋盘", onContinue: () => { closeModal(); render(); }
  });
  render();
}

function waitDetention() {
  const player = currentPlayer();
  player.detained = false;
  addLog(`${player.hero.name}在滞留区等待一回合，下次恢复行动`);
  toast("本回合用于冷静复盘，下次恢复正常行动");
  nextTurn();
}

function useRescueForDetention() {
  const player = currentPlayer();
  if (!player.rescue) return;
  player.rescue = false;
  player.detained = false;
  state.phase = "roll";
  $("#detentionActions").hidden = true;
  $("#rollButton").hidden = false;
  $("#turnPrompt").textContent = "96110 求助卡已使用，本回合可以正常掷骰。";
  addLog(`${player.hero.name}使用 96110 求助卡解除滞留`);
  tone(720, .14);
  render();
}

function showModal({ icon, type, title, location = "", body = "", choices = [], locked = true, continueText = "", onContinue = null, cardType = "" }) {
  state.modalLocked = locked;
  state.modalContinue = onContinue;
  $("#modalIcon").textContent = icon;
  $("#modalType").textContent = type;
  $("#modalTitle").textContent = title;
  $("#modalLocation").textContent = location;
  $("#modalLocation").hidden = !location;
  $("#storyCopy").innerHTML = body;
  $(".story-modal").dataset.cardType = cardType;
  $("#feedback").hidden = true;
  $("#feedback").className = "feedback";
  $("#feedback").innerHTML = "";
  const list = $("#choiceList");
  list.replaceChildren();
  choices.forEach(item => list.append(makeChoice(item)));
  $("#modalClose").hidden = locked;
  $("#continueButton").hidden = !continueText;
  $("#continueButton").textContent = continueText;
  if (continueText && !onContinue) state.modalContinue = closeModal;
  $("#modalOverlay").hidden = false;
}

function makeChoice(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-button";
  button.innerHTML = `<b>${item.label}</b><span>${item.text}<small>${item.sub || ""}</small></span>`;
  button.addEventListener("click", item.action, { once: true });
  return button;
}

function disableChoices(good) {
  $$(".choice-button", $("#choiceList")).forEach(button => button.disabled = true);
  const clicked = document.activeElement?.closest?.(".choice-button");
  if (clicked) clicked.classList.add(good ? "good" : "bad");
}

function showFeedback(good, title, text) {
  const feedback = $("#feedback");
  feedback.hidden = false;
  feedback.className = `feedback ${good ? "" : "loss"}`;
  feedback.innerHTML = `<strong>${title}</strong>${text}`;
}

function closeModal() {
  $("#modalOverlay").hidden = true;
  state.modalLocked = false;
  state.modalContinue = null;
}

function addLog(text) {
  state.logs.unshift(text);
  state.logs = state.logs.slice(0, 20);
  $("#actionLog").innerHTML = state.logs.map(item => `<li>${item}</li>`).join("");
}

function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2500);
}

let audioContext;
function tone(frequency, duration) {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {}
}

function openRules() {
  $("#rulesDrawer").classList.add("open");
  $("#rulesDrawer").setAttribute("aria-hidden", "false");
  $("#drawerMask").hidden = false;
}
function closeRules() {
  $("#rulesDrawer").classList.remove("open");
  $("#rulesDrawer").setAttribute("aria-hidden", "true");
  $("#drawerMask").hidden = true;
}

function openSetup() {
  if (state.started && !state.finished && !confirm("新对局会结束当前进度，确定继续吗？")) return;
  if (state.timer) clearInterval(state.timer);
  closeModal();
  $("#setupOverlay").hidden = false;
}

function updateCamera(delta = 0) {
  state.tilt = Math.max(18, Math.min(44, state.tilt + delta));
  document.documentElement.style.setProperty("--camera-tilt", `${state.tilt}deg`);
  document.documentElement.style.setProperty("--camera-counter-tilt", `${-state.tilt}deg`);
}

$("#rollButton").addEventListener("click", rollDice);
$("#waitButton").addEventListener("click", waitDetention);
$("#useRescueButton").addEventListener("click", useRescueForDetention);
$("#startButton").addEventListener("click", startGame);
$("#newGameButton").addEventListener("click", openSetup);
$("#rulesButton").addEventListener("click", openRules);
$("#drawerClose").addEventListener("click", closeRules);
$("#drawerMask").addEventListener("click", closeRules);
$("#modalClose").addEventListener("click", () => { if (!state.modalLocked) closeModal(); });
$("#continueButton").addEventListener("click", () => {
  const action = state.modalContinue;
  if (action) action();
  else closeModal();
});
$("#modeOptions").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  state.mode = button.dataset.mode;
  $$("#modeOptions button").forEach(item => item.classList.toggle("selected", item === button));
});
$("#soundButton").addEventListener("click", () => {
  state.sound = !state.sound;
  $("#soundButton").textContent = `音效：${state.sound ? "开" : "关"}`;
  if (state.sound) tone(520, .08);
});
$("#viewButton").addEventListener("click", () => {
  state.topView = !state.topView;
  document.body.classList.toggle("top-view", state.topView);
  $("#viewButton").textContent = state.topView ? "立体棋盘" : "俯视棋盘";
});
$("#rotateLeft").addEventListener("click", () => updateCamera(-4));
$("#rotateRight").addEventListener("click", () => updateCamera(4));
$("#resetCamera").addEventListener("click", () => { state.tilt = 34; updateCamera(0); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if ($("#rulesDrawer").classList.contains("open")) closeRules();
    else if (!state.modalLocked) closeModal();
  }
});

buildBoard();
buildSetup();
updateCamera(0);
render();
