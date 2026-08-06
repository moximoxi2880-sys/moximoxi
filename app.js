const board = document.querySelector('#board');
const rollButton = document.querySelector('#rollButton');
const diceValue = document.querySelector('#diceValue');
const rollStatus = document.querySelector('#rollStatus');
const turnHint = document.querySelector('#turnHint');
const progressBar = document.querySelector('#progressBar');
const progressText = document.querySelector('#progressText');
const shieldCount = document.querySelector('#shieldCount');
const roundNumber = document.querySelector('#roundNumber');
const modalBackdrop = document.querySelector('#modalBackdrop');
const modalTag = document.querySelector('#modalTag');
const modalTitle = document.querySelector('#modalTitle');
const dialogue = document.querySelector('#dialogue');
const choiceArea = document.querySelector('#choiceArea');
const continueButton = document.querySelector('#continueButton');
const toast = document.querySelector('#toast');

const cells = [
  { name: '出发', icon: '🚩', type: 'home' }, { name: '守护家人', icon: '🤝', type: 'safe' }, { name: '刷单陷阱', icon: '⚠️', type: 'risk', scenario: 'brushing' }, { name: '反诈课堂', icon: '📚', type: 'knowledge', scenario: 'knowledge' }, { name: '社区宣传', icon: '📣', type: 'service' }, { name: '冒充客服', icon: '💬', type: 'risk', scenario: 'refund' }, { name: '安全通行', icon: '🌿', type: 'safe' },
  { name: '网络交友', icon: '💔', type: 'risk', scenario: 'romance' }, { name: '热线守护', icon: '☎️', type: 'service' }, { name: '验证码', icon: '🔐', type: 'knowledge', scenario: 'knowledge' }, { name: '投资理财', icon: '📈', type: 'risk', scenario: 'investment' }, { name: '邻里提醒', icon: '🏘️', type: 'service' }, { name: '安全通行', icon: '🌿', type: 'safe' }, { name: '法治驿站', icon: '⚖️', type: 'service' },
  { name: '冒充公检法', icon: '⚖️', type: 'risk', scenario: 'police' }, { name: '反诈课堂', icon: '📚', type: 'knowledge', scenario: 'knowledge' }, { name: '青年志愿', icon: '❤️', type: 'service' }, { name: '钓鱼链接', icon: '🔗', type: 'risk', scenario: 'phishing' }, { name: '安全通行', icon: '🌿', type: 'safe' }, { name: '预警劝阻', icon: '🛡️', type: 'service' }, { name: '保护密码', icon: '🔒', type: 'knowledge', scenario: 'knowledge' },
  { name: '虚假快递', icon: '📦', type: 'risk', scenario: 'delivery' }, { name: '群防群治', icon: '👥', type: 'service' }, { name: '安全通行', icon: '🌿', type: 'safe' }, { name: '共享屏幕', icon: '🖥️', type: 'risk', scenario: 'screen' }, { name: '反诈课堂', icon: '📚', type: 'knowledge', scenario: 'knowledge' }, { name: '守护社区', icon: '🏠', type: 'service' }, { name: '平安终点', icon: '🏆', type: 'finish' }
];

const positions = [
  [1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7], [2,7],[3,7],[4,7],[5,7],[5,6],[5,5],[5,4],[5,3],[5,2],[5,1],[4,1],[3,1],[2,1], [2,2],[2,3],[2,4],[2,5],[2,6],[3,6],[4,6],[4,5]
];

let position = 0; let shields = 2; let round = 1; let rolling = false;

const scenarios = {
  refund: { title: '警惕“客服退款”骗局', lines: [['诈骗分子', '您好，我是平台客服，您购买的商品有质量问题，现在为您办理三倍退款。'], ['诈骗分子', '请点击这个链接，下载“退款专员”APP，按提示开启屏幕共享。']], question: '面对这通“退款”电话，你会怎么做？', choices: ['点击链接，尽快领取赔偿', '挂断电话，通过官方平台客服核实', '把验证码告诉对方，完成退款'], correct: 1, result: '做得好！正规平台不会要求下载陌生软件或开启屏幕共享。' },
  brushing: { title: '警惕“刷单返利”骗局', lines: [['诈骗分子', '在家刷单就能轻松赚钱，第一单返现30元，名额有限！'], ['诈骗分子', '先垫付500元，完成任务后本金和佣金马上到账。']], question: '你会如何应对？', choices: ['先小额试一单看看', '不相信“垫资返利”，保留证据并举报', '向亲友借钱继续做高佣金任务'], correct: 1, result: '判断正确！所有需要先垫资的刷单、返利，都是诈骗高发套路。' },
  police: { title: '警惕“冒充公检法”骗局', lines: [['诈骗分子', '你涉嫌洗钱，警方正在调查。为证明清白，请将资金转入“安全账户”。'], ['诈骗分子', '此案保密，不能告诉任何人，否则立即逮捕。']], question: '你会怎么处理？', choices: ['按对方指示转入安全账户', '保持冷静，挂断后到公安机关或拨打110核实', '把银行卡、密码提供给对方审查'], correct: 1, result: '正确！公检法机关不会通过电话、网络办案，更不存在“安全账户”。' },
  investment: { title: '警惕“高收益投资”骗局', lines: [['诈骗分子', '内部消息：这只数字货币马上暴涨，老师带你稳赚不赔。'], ['诈骗分子', '加入VIP群，今天充值就送20%体验金。']], question: '面对“稳赚不赔”的投资邀请，你会？', choices: ['跟着群里的“老师”先投资', '拒绝高收益诱惑，选择正规持牌渠道', '贷款加仓，抓住难得机会'], correct: 1, result: '正确！“保本高收益”“内幕消息”常是投资诈骗的诱饵。' },
  romance: { title: '警惕“网络交友”骗局', lines: [['诈骗分子', '和你聊了这么久，我只信任你。现在家人急需手术费，能先借我吗？'], ['诈骗分子', '别告诉别人，他们都不理解我们的感情。']], question: '你会如何回应？', choices: ['立即转账帮助“恋人”', '不转账，先核实身份并向亲友求助判断', '发送身份证和银行卡信息证明信任'], correct: 1, result: '正确！素未谋面的“恋人”一旦以各种理由借钱，应提高警惕。' },
  phishing: { title: '警惕“钓鱼链接”骗局', lines: [['诈骗分子', '您的社保卡已停用，请在24小时内点击链接验证信息。']], question: '收到带链接的“官方提醒”，你会？', choices: ['立刻点击填写身份证和银行卡', '不点陌生链接，通过官方渠道查询', '转发给家人一起填写'], correct: 1, result: '正确！政务服务不会用陌生短链索取银行卡、验证码等敏感信息。' },
  delivery: { title: '警惕“快递赔付”骗局', lines: [['诈骗分子', '您的快递丢失，可赔付300元。请加客服微信办理。'], ['诈骗分子', '您信用分不足，需要先转账认证才能到账。']], question: '你会如何选择？', choices: ['添加对方微信办理赔付', '联系购物平台或快递官方客服核验', '先转账“认证”，再等赔付'], correct: 1, result: '正确！快递理赔请从订单内或官方客服电话进入，不要脱离正规平台。' },
  screen: { title: '警惕“屏幕共享”骗局', lines: [['诈骗分子', '为了远程指导您办理贷款，请打开屏幕共享，把验证码读给我。']], question: '对方要求屏幕共享与验证码时，你会？', choices: ['开启共享，方便对方操作', '立即拒绝，退出通话并保护账户', '把手机交给对方远程控制'], correct: 1, result: '正确！屏幕共享会暴露验证码和账户信息，陌生人要求时必须拒绝。' },
  knowledge: { title: '反诈知识加油站', lines: [['反诈志愿者', '请记住：验证码是账户安全的最后一道门，任何人索要都不能给。']], question: '接到96110预警劝阻电话，正确做法是？', choices: ['担心是骚扰，直接挂断', '及时接听，按民警提示核实情况', '把号码拉黑，继续转账'], correct: 1, result: '回答正确！96110是全国预警劝阻专线，接到电话请积极配合。' }
};

function buildBoard() {
  board.innerHTML = '';
  const map = new Map(positions.map((entry, index) => [entry.join('-'), index]));
  for (let row = 1; row <= 5; row++) for (let col = 1; col <= 7; col++) {
    const cell = document.createElement('div');
    const current = map.get(`${row}-${col}`);
    if (current === undefined) continue;
    const data = cells[current]; cell.className = `cell ${data.type}`; cell.dataset.index = current;
    cell.style.gridColumn = col; cell.style.gridRow = row;
    cell.innerHTML = `<small class="cell-number">${current + 1}</small><span class="cell-icon">${data.icon}</span><span class="cell-name">${data.name}</span>`;
    board.append(cell);
  }
  addToken();
}
function addToken() { document.querySelectorAll('.token').forEach(node => node.remove()); const target = board.querySelector(`[data-index="${position}"]`); if (target) { const token = document.createElement('span'); token.className = 'token'; token.textContent = '青'; target.append(token); } }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(window.toastTimeout); window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 2600); }
function updateProgress() { const value = Math.round(position / (cells.length - 1) * 100); progressBar.style.width = `${value}%`; progressText.textContent = `${value}%`; shieldCount.textContent = shields; roundNumber.textContent = round; }
function closeModal() { modalBackdrop.hidden = true; }
function openScenario(key) { const scenario = scenarios[key]; if (!scenario) return; modalTag.textContent = key === 'knowledge' ? '反诈知识加油站' : '情景模拟 · 角色扮演'; modalTitle.textContent = scenario.title; dialogue.replaceChildren(); scenario.lines.forEach(line => { const bubble = document.createElement('div'); const speaker = document.createElement('span'); bubble.className = 'bubble scammer'; speaker.className = 'speaker'; speaker.textContent = line[0]; bubble.append(speaker, document.createTextNode(line[1])); dialogue.append(bubble); }); choiceArea.replaceChildren(); const question = document.createElement('p'); question.textContent = scenario.question; const choices = document.createElement('div'); choices.className = 'choices'; scenario.choices.forEach((choice, index) => { const button = document.createElement('button'); button.className = 'choice'; button.type = 'button'; button.dataset.choice = index; button.textContent = `${String.fromCharCode(65 + index)}. ${choice}`; choices.append(button); }); choiceArea.append(question, choices); continueButton.hidden = false; modalBackdrop.hidden = false;
  choiceArea.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => handleChoice(button, Number(button.dataset.choice), scenario)));
}
function handleChoice(button, answer, scenario) { const buttons = choiceArea.querySelectorAll('.choice'); buttons.forEach(item => item.disabled = true); if (answer === scenario.correct) { button.classList.add('correct'); shields = Math.min(5, shields + 1); showToast('识诈成功！获得 1 枚守护盾'); choiceArea.insertAdjacentHTML('beforeend', `<div class="scenario-result">${scenario.result}<br>你为社区反诈治理贡献了一份青春力量。</div>`); } else { button.classList.add('wrong'); shields = Math.max(0, shields - 1); buttons[scenario.correct].classList.add('correct'); showToast('别灰心，记住正确的防骗方法'); choiceArea.insertAdjacentHTML('beforeend', `<div class="scenario-result">正确答案：${scenario.choices[scenario.correct]}。${scenario.result}</div>`); } updateProgress(); }
function movePlayer() { if (rolling) return; rolling = true; rollButton.disabled = true; rollButton.classList.add('rolling'); const value = Math.floor(Math.random() * 6) + 1; diceValue.textContent = '•'; turnHint.textContent = '反诈志愿者正在前进…'; setTimeout(() => { diceValue.textContent = value; rollButton.classList.remove('rolling'); position = Math.min(cells.length - 1, position + value); addToken(); updateProgress(); rollStatus.textContent = `前进 ${value} 格`; const landed = cells[position]; if (position === cells.length - 1) { rollStatus.textContent = '恭喜抵达平安终点！'; turnHint.textContent = '你已完成本轮反诈守护行动'; showToast('恭喜！平安社区因你更安全'); round++; } else if (landed.scenario) { setTimeout(() => openScenario(landed.scenario), 450); } else if (landed.type === 'service') { shields = Math.min(5, shields + 1); updateProgress(); showToast('参与基层宣传，获得 1 枚守护盾'); } else { showToast(`来到“${landed.name}”，继续保持警惕！`); } rolling = false; rollButton.disabled = position === cells.length - 1; }, 650); }
function restart() { position = 0; shields = 2; round = 1; rollButton.disabled = false; diceValue.textContent = '✦'; rollStatus.textContent = '准备出发'; turnHint.textContent = '点击骰子，开启守护行动'; updateProgress(); addToken(); showToast('新的一局开始，守护从第一步出发'); }

rollButton.addEventListener('click', movePlayer); document.querySelector('#restartButton').addEventListener('click', restart); document.querySelector('#closeModal').addEventListener('click', closeModal); continueButton.addEventListener('click', closeModal); document.addEventListener('click', event => { if (event.target.closest('#closeModal, #continueButton') || event.target === modalBackdrop) closeModal(); }); document.querySelector('#ruleButton').addEventListener('click', () => { modalTag.textContent = '游戏规则'; modalTitle.textContent = '如何玩反诈飞行棋？'; dialogue.innerHTML = `<div class="bubble player"><span class="speaker">行动说明</span>掷骰子前进，落在风险格时完成情景选择；答对可获得守护盾，抵达终点即完成一轮平安社区守护。</div><div class="bubble player"><span class="speaker">治理视角</span>把识诈、防诈知识带回社区、宿舍和家庭，让青年成为基层社会治理中的反诈力量。</div>`; choiceArea.innerHTML = ''; continueButton.hidden = false; modalBackdrop.hidden = false; });
buildBoard(); updateProgress();
