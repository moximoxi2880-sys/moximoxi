const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const MOVE_STEP_MS = 330;

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
  special("陷入骗局滞留区", "⏸", "detention", "正常移动落到这里仅为“路过参观”；只有风险惩戒卡传送才会进入滞留状态。"),
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

const quizBank = [
  {
    title: "养老项目的高息承诺", scene: "一名“养老顾问”带着礼品上门，承诺投入 5 万元后每月返息，还能优先入住养老院。",
    question: "此时最稳妥的处理方式是什么？", correct: "暂不付款，和家人一起核验机构资质、资金用途与合同",
    wrong: ["先交小额定金锁定名额，再慢慢调查", "看见其他老人签约就跟着购买", "把银行卡交给顾问代办手续"],
    caseId: "养老投资", clue: "高息养老项目", explanation: "以养老服务、免费礼品和高息回报吸引老年人付款，是常见骗局组合。正规投资不会回避资质、合同与风险说明。"
  },
  {
    title: "AI 视频里的亲友", scene: "“表弟”突然视频联系你，说工程款周转困难，要求十分钟内转到一个陌生账户。",
    question: "怎样核验最有效？", correct: "挂断后拨打表弟原号码，并询问只有双方知道的事情",
    wrong: ["视频里长得一样，可以直接转账", "先转一半，之后再电话确认", "让对方再发一张身份证照片就转账"],
    caseId: "AI 换脸", clue: "视频也要二次核验", explanation: "AI 换脸和拟声可以伪造视频与声音。换用原有联系方式、核对私密信息，才能形成有效的身份核验。"
  },
  {
    title: "游戏装备低价代充", scene: "群友发来“内部五折代充”，要求退出官方平台，通过私人二维码付款。",
    question: "你应该怎么做？", correct: "拒绝私下交易，只使用游戏官方认可的充值渠道",
    wrong: ["先充最低档试试，到账后再加大金额", "要求对方发成功订单截图后付款", "拉一位朋友拼单，分摊被骗风险"],
    caseId: "游戏充值", clue: "脱离平台付款", explanation: "低价只是诱饵，脱离官方平台后很难申诉。订单截图和小额到账都可能用于骗取后续大额付款。"
  },
  {
    title: "刷单返利升级任务", scene: "你做了两笔小任务并收到返利，群主随后要求连续完成三笔大额“联单”才能提现。",
    question: "正确选择是什么？", correct: "立即停止转账，保存聊天和付款证据并报警咨询",
    wrong: ["再完成一单，把之前的钱一起拿回来", "向群友借钱做完联单", "缴纳群主提出的提现保证金"],
    caseId: "刷单返利", clue: "小利诱导大额投入", explanation: "先给小额返利建立信任，再以联单、解冻、提现为由持续索款，是刷单诈骗的典型路径。"
  },
  {
    title: "网贷账户需要解冻", scene: "贷款页面显示“银行卡号错误”，客服说交 6000 元解冻金后贷款和解冻金会一起到账。",
    question: "哪项判断正确？", correct: "放款前收费是危险信号，应停止操作并联系正规持牌机构",
    wrong: ["平台能显示合同，交钱一般没问题", "只要客服承诺退款，就可以先交", "重新借一笔钱缴纳解冻金最快"],
    caseId: "虚假网贷", clue: "放款前收费", explanation: "正规贷款机构不会以账号错误、流水不足为由要求先交解冻金或认证金。越是急需资金，越要核对平台资质。"
  },
  {
    title: "快递丢失主动理赔", scene: "“快递客服”准确报出你的订单信息，发来网址并要求填写银行卡、密码和短信验证码。",
    question: "应该如何办理理赔？", correct: "退出链接，从购物平台订单页或快递官方客服发起核验",
    wrong: ["订单信息准确，按对方步骤填写", "只填写银行卡和验证码，不填密码", "先开启屏幕共享，让客服远程操作"],
    caseId: "快递理赔", clue: "陌生理赔链接", explanation: "个人订单信息可能泄露，不能据此相信来电。验证码、密码和屏幕共享都可能让骗子直接控制资金。"
  },
  {
    title: "客服要求共享屏幕", scene: "自称平台客服的人说你误开了会员，不关闭就会连续扣费，并指导你下载会议软件共享屏幕。",
    question: "你应当立即做什么？", correct: "拒绝共享屏幕，挂断后从平台官方入口联系人工客服",
    wrong: ["把支付页面遮住后继续共享", "只共享五分钟，办完就退出", "关闭短信通知后让客服操作"],
    caseId: "冒充客服", clue: "共享屏幕会暴露验证码", explanation: "共享屏幕可能暴露短信验证码、银行卡信息和支付过程。所谓自动扣费常用于制造紧迫感。"
  },
  {
    title: "补贴申报群通知", scene: "群内“乡镇干部”发来助农补贴二维码，称今晚截止，登记银行卡并交认证费即可领取。",
    question: "怎样确认通知真假？", correct: "通过村委会公示电话或政务平台独立核实，不扫群内二维码",
    wrong: ["群里已有多人回复收到，直接登记", "先交认证费，补贴到账后再核实", "私聊对方索要工作证照片即可"],
    caseId: "冒充补贴", clue: "官方事项不收私人认证费", explanation: "头像、工作证照片和群友反馈都可能伪造。补贴申报应以政府公示、政务平台和公开电话为准。"
  },
  {
    title: "云认养果树分红", scene: "项目宣传“认养一棵果树，每月固定分红，期满保本回购”，但不允许实地查看果园。",
    question: "最明显的风险信号是什么？", correct: "承诺保本固定高收益，却无法说明真实经营和收益来源",
    wrong: ["宣传片拍得不够清晰", "果树品种不是本地品种", "项目没有赠送水果礼盒"],
    caseId: "虚假投资", clue: "保本高收益", explanation: "投资必然伴随风险。“保本、高息、稳赚”与拒绝实地核验同时出现时，应高度警惕非法集资或虚假项目。"
  },
  {
    title: "网恋对象带你投资", scene: "认识一个月的网友每天关心你，随后发来一个“内部投资平台”，展示自己每天稳定盈利。",
    question: "哪项做法最安全？", correct: "拒绝充值，核验对方身份并向亲友或警方咨询",
    wrong: ["先投入 500 元验证平台收益", "让对方替自己充值，盈利后再还", "下载对方推荐的远程控制软件"],
    caseId: "交友投资", clue: "感情铺垫后引导投资", explanation: "长期培养感情再诱导投资，是“杀猪盘”常见套路。前期小额盈利也可能只是后台伪造数字。"
  },
  {
    title: "公检法安全账户", scene: "来电者自称公安，准确说出你的姓名，称你涉嫌洗钱，要求把钱转入“安全账户”接受审查。",
    question: "哪项说法是正确的？", correct: "公检法不会电话办案，更不存在用于个人转账的安全账户",
    wrong: ["只要能出示警官证视频，就可以配合", "先转账自证清白，再到派出所询问", "案件保密，不能告诉家人或当地民警"],
    caseId: "冒充公检法", clue: "不存在安全账户", explanation: "要求保密、远程做笔录、转入安全账户，是冒充公检法诈骗的核心话术。应直接联系当地公安机关核验。"
  },
  {
    title: "直播代运营包爆单", scene: "代运营公司展示大量成交截图，承诺七天让农产品直播间爆单，但要求私下先付全年服务费。",
    question: "付款前最需要做什么？", correct: "核验公司主体、真实案例、合同责任和平台内交易保障",
    wrong: ["相信成交截图，抢在优惠截止前付款", "只问能否保证最低销量", "让对方口头承诺退款即可"],
    caseId: "直播代运营", clue: "保证爆单", explanation: "成交截图容易伪造，口头承诺也难以追责。应查主体、查案例、看合同，并尽量使用可追溯的正规渠道。"
  },
  {
    title: "农资低价采购", scene: "陌生供应商报价比市场低四成，要求将全部货款转入业务员个人账户，称明天就发货。",
    question: "最可靠的处理方式是什么？", correct: "核验企业登记、对公账户和合同，必要时实地查验货物",
    wrong: ["让业务员发仓库视频后转个人账户", "先付全款换取更低价格", "看到朋友圈经营多年即可相信"],
    caseId: "农资采购", clue: "私人账户收款", explanation: "异常低价、催促全款、个人账户收款同时出现，风险极高。采购应保留合同、票据和可核验的企业收款信息。"
  },
  {
    title: "高价包销先交保证金", scene: "采购商愿意高价收购整园蜜桔，却以“锁定渠道”为由要求果农先交 2 万元保证金。",
    question: "合理的判断是什么？", correct: "高价回收却要求卖方先付款不合常理，应核验主体和履约能力",
    wrong: ["价格越高越要尽快交保证金", "只要签了电子合同就没有风险", "让采购商打欠条后就可转账"],
    caseId: "预付保证金", clue: "先付款、后签约", explanation: "骗子常用高价订单吸引经营者，再虚构保证金、质检费、渠道费。异常交易逻辑本身就是核验重点。"
  },
  {
    title: "中奖要先缴税", scene: "短视频弹窗显示你中了手机，但领取前必须向个人收款码支付“税费和物流保证金”。",
    question: "应该怎样处理？", correct: "不付款、不点链接，通过平台官方活动页面核实并举报",
    wrong: ["奖品价值高，先付少量税费很划算", "让对方发获奖证书后付款", "用另一张余额少的银行卡支付"],
    caseId: "虚假中奖", clue: "领奖前多次收费", explanation: "虚假中奖通常以税费、保证金、物流费层层加码。是否使用小额账户并不能消除钓鱼和信息泄露风险。"
  },
  {
    title: "学校缴费紧急通知", scene: "家长群里“班主任”发收款码，要求一小时内缴纳研学费，并提醒不要私聊打扰。",
    question: "家长首先应该怎么做？", correct: "通过学校原有电话、其他老师或线下渠道交叉核实",
    wrong: ["群头像和昵称都正确，立即扫码", "等其他家长付款后跟着转", "先付款保留名额，明天再问老师"],
    caseId: "冒充老师", clue: "群内身份可被冒充", explanation: "骗子可能盗号或潜入群聊，头像、昵称和群内跟风回复均不足以证明身份。紧急收款尤其需要换渠道核实。"
  },
  {
    title: "熟人微信突然借钱", scene: "多年好友发消息称手机进水无法接电话，急需你把钱转给“供应商”，稍后就还。",
    question: "哪种核验方式最有效？", correct: "联系好友本人或共同熟人，确认用途与收款账户",
    wrong: ["语气和好友一样，可以直接转", "查看朋友圈更新正常就转账", "让对方写一句保证还款的话"],
    caseId: "盗号冒充熟人", clue: "换渠道确认本人", explanation: "账号可能被盗，聊天语气和朋友圈也可能被模仿或控制。涉及转账时必须用另一条可信渠道确认。"
  },
  {
    title: "陌生二维码领红包", scene: "摊位海报写着“扫码领 200 元消费券”，扫码后网页要求开通免密支付并输入验证码。",
    question: "此时应当怎么做？", correct: "立即退出页面，不开免密支付，并从官方渠道查询活动",
    wrong: ["领完券后再关闭免密支付", "只输入验证码，不填写银行卡密码", "使用家人的手机扫码更安全"],
    caseId: "钓鱼链接", clue: "验证码等同重要授权", explanation: "验证码可能正在授权支付、绑卡或登录。陌生二维码与高额福利组合时，不要继续填写任何敏感信息。"
  },
  {
    title: "虚假慈善募捐", scene: "自称公益协会的人展示灾区照片，要求把捐款转到工作人员个人账户，称时间紧急来不及开票。",
    question: "正确的捐赠方式是什么？", correct: "查询慈善组织公开募捐资格，通过官方公示渠道捐赠",
    wrong: ["善款金额不大，转个人账户也可以", "看到盖章倡议书就直接付款", "要求对方承诺以后补发票"],
    caseId: "虚假慈善", clue: "个人收款码", explanation: "爱心不能替代核验。公开募捐应具备相应资格，并通过可查询、可追溯的官方渠道进行。"
  },
  {
    title: "数字货币投资群", scene: "群内老师每天晒收益，称掌握内幕消息，要求下载一个应用商店搜不到的投资软件。",
    question: "哪项是最关键的风险判断？", correct: "内幕荐股、非官方软件和稳赚承诺同时出现，应立即远离",
    wrong: ["群里人数很多，平台应该可靠", "老师愿意语音指导，可以小额尝试", "先观察三天收益排名再决定"],
    caseId: "虚假理财", clue: "指定软件跟投", explanation: "所谓导师、群友和盈利记录可能都是骗局的一部分，虚假平台上的余额数字也无法证明真实收益。"
  },
  {
    title: "银行卡刷流水", scene: "兼职中介称只需提供银行卡帮公司走账，一天可赚 800 元，还保证“只是正常避税”。",
    question: "你应当如何处理？", correct: "拒绝提供银行卡并报警咨询，避免卷入违法资金转移",
    wrong: ["把卡内余额清空后借给对方", "设置较低转账限额就能参与", "签一份免责协议后提供银行卡"],
    caseId: "两卡犯罪", clue: "出租出借银行卡违法", explanation: "出租、出借、出售银行卡和电话卡可能帮助诈骗资金流转，承担严重法律和信用风险。"
  },
  {
    title: "退费公告里的客服", scene: "你收到培训机构“清退学费”短信，链接里的客服要求购买证券完成增值任务后才能退款。",
    question: "怎样识别和处置？", correct: "这是以退费为名的二次诈骗，应通过原机构公开渠道核实",
    wrong: ["先完成最低金额任务测试能否到账", "机构确实停业，所以客服一定是真的", "只要对方签电子退款协议就参与"],
    caseId: "虚假退费", clue: "退款却要求先投资", explanation: "退款与购买证券、做任务没有合理关系。骗子常利用真实机构停业信息，对受害者实施二次诈骗。"
  },
  {
    title: "手机收到屏幕共享邀请", scene: "对方声称帮你取消百万保障，要求打开会议软件，并让你把共享屏幕从“仅应用”改为“整个屏幕”。",
    question: "为什么必须立即拒绝？", correct: "整个屏幕会暴露验证码、支付密码输入过程和账户信息",
    wrong: ["共享屏幕会损坏手机摄像头", "会议软件都会自动扣除会员费", "共享超过十分钟手机会被永久锁定"],
    caseId: "共享屏幕", clue: "远程窥屏", explanation: "屏幕共享本身不会直接损坏手机，但会让对方实时看到敏感信息，并配合话术诱导完成转账。"
  },
  {
    title: "电商店铺违规解封", scene: "私聊客服称店铺将在十分钟后永久封禁，必须点击链接缴纳“信用恢复费”。",
    question: "店主应该从哪里处理？", correct: "从商家后台或平台官方客服电话进入申诉流程",
    wrong: ["时间紧，先点私聊链接缴费", "让客服发营业执照后再付款", "换一张银行卡支付以保护主账户"],
    caseId: "冒充平台客服", clue: "制造紧迫感", explanation: "平台处罚和申诉应在官方后台留痕。私聊链接、额外收费和倒计时常用于让人来不及核验。"
  }
];

function shuffle(list) {
  const result = [...list];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

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
  { title: "刷单连环任务", text: "小额返利后出现必须连续完成的大额任务，你被话术困住了。", icon: "📱", effect: "detention", caseId: "刷单返利", label: "进入骗局滞留区" },
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
  phase: "setup", extraRoll: false, selectedHeroes: new Set(["red", "blue"]),
  cases: new Set(), logs: [], secondsLeft: 28 * 60, timer: null, tilt: 34, topView: false,
  sound: true, modalLocked: false, modalContinue: null, rewardIndex: 0, riskIndex: 0, mixedDeck: "reward",
  quizOrder: [], quizCursor: 0, lastQuizIndex: -1
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
  state.extraRoll = false;
  state.cases = new Set();
  state.logs = [];
  state.secondsLeft = 28 * 60;
  state.rewardIndex = Math.floor(Math.random() * rewardCards.length);
  state.riskIndex = Math.floor(Math.random() * riskCards.length);
  state.mixedDeck = Math.random() > .5 ? "reward" : "risk";
  state.quizOrder = shuffle(quizBank.map((_, index) => index));
  state.quizCursor = 0;
  state.lastQuizIndex = -1;
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
  $("#detentionActions").hidden = !player.detained;
  $("#useRescueButton").disabled = !player.rescue;
  $("#rollButton").hidden = player.detained;
  $("#turnPrompt").textContent = player.detained
    ? "本回合不能掷骰：等待一回合，或消耗 96110 求助卡立即解除。"
    : `${player.hero.name}，掷一颗骰子沿棋盘顺时针调查。`;
  render();
}

async function rollDice() {
  if (state.phase !== "roll" || state.finished) return;
  state.phase = "rolling";
  state.extraRoll = false;
  render();
  const roll = Math.ceil(Math.random() * 6);
  const rollStage = $("#rollStage");
  rollStage.hidden = false;
  rollStage.className = "roll-stage rolling";
  $("#rollStageResult").textContent = "投掷中";
  $("#stageDiceFace").dataset.value = String(roll % 6 + 1);
  $("#dieOne").classList.add("rolling");
  tone(260, .07);
  await wait(920);
  $("#dieOne").classList.remove("rolling");
  $("#dieValue").textContent = `${roll} 点`;
  $("#consoleDiceFace").dataset.value = String(roll);
  $("#stageDiceFace").dataset.value = String(roll);
  $("#rollStageResult").textContent = `${roll} 点`;
  rollStage.className = "roll-stage settled";
  tone(540 + roll * 24, .12);
  addLog(`${currentPlayer().hero.name}掷出 ${roll} 点`);
  await wait(560);
  rollStage.hidden = true;
  rollStage.className = "roll-stage";
  await movePlayer(roll);
}

async function movePlayer(steps) {
  state.phase = "moving";
  $("#turnPrompt").textContent = `前进 ${steps} 格，沿途留意风险信号……`;
  render();
  const player = currentPlayer();
  const pawn = $(`#pawn-${player.hero.id}`);
  for (let step = 0; step < steps; step++) {
    player.position = (player.position + 1) % tiles.length;
    if (player.position === 0) {
      player.safety += 10;
      addLog(`${player.hero.name}经过马蹄岗复盘站，安全值 +10`);
      tone(620, .05);
    }
    pawn.style.setProperty("--step-sway", step % 2 ? "-3deg" : "3deg");
    pawn.classList.remove("stepping");
    void pawn.offsetWidth;
    pawn.classList.add("stepping");
    renderPawns();
    renderCurrent();
    if (step % 2 === 0) tone(320 + (step % 4) * 35, .035);
    await wait(MOVE_STEP_MS);
    pawn.classList.remove("stepping");
    await wait(35);
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

function nextQuiz() {
  if (!state.quizOrder.length || state.quizCursor >= state.quizOrder.length) {
    state.quizOrder = shuffle(quizBank.map((_, index) => index));
    if (state.quizOrder.length > 1 && state.quizOrder[0] === state.lastQuizIndex) {
      [state.quizOrder[0], state.quizOrder[1]] = [state.quizOrder[1], state.quizOrder[0]];
    }
    state.quizCursor = 0;
  }
  const quizIndex = state.quizOrder[state.quizCursor++];
  state.lastQuizIndex = quizIndex;
  return quizBank[quizIndex];
}

function openRandomQuiz(tile, location, sourceType) {
  const quiz = nextQuiz();
  const options = shuffle([
    { text: quiz.correct, good: true },
    ...quiz.wrong.map(text => ({ text, good: false }))
  ]);
  showModal({
    icon: tile.icon, type: `${sourceType} · 随机四选一`, title: quiz.title, location: `${location} · ${tile.name}`,
    body: `<div class="quiz-scene"><small>本轮随机情景</small><p>“${quiz.scene}”</p></div><h3 class="quiz-question">${quiz.question}</h3><div class="clue-callout"><span>题目随机</span><span>选项顺序随机</span><span>仅 1 项正确</span></div>`,
    locked: true,
    choices: options.map((option, index) => ({
      label: String.fromCharCode(65 + index),
      text: option.text,
      sub: "选择这项处理方式",
      action: () => resolveQuizAnswer(option.good, quiz)
    }))
  });
}

function openTrap(tile, location) {
  openRandomQuiz(tile, location, "诈骗陷阱");
}

function openChoice(tile, location) {
  openRandomQuiz(tile, location, "情景抉择");
}

function resolveQuizAnswer(good, quiz) {
  disableChoices(good);
  const player = currentPlayer();
  if (good) {
    player.safety += 8;
    addClue(player);
    state.cases.add(quiz.caseId);
    addLog(`${player.hero.name}答对“${quiz.caseId}”随机题，安全值 +8`);
    showFeedback(true, `回答正确：${quiz.clue}`, `${quiz.explanation} 安全值 +8，并获得 1 条调查线索。`);
    tone(640, .12);
    prepareContinue();
  } else {
    addLog(`${player.hero.name}答错“${quiz.caseId}”随机题，承担风险`);
    showFeedback(false, `回答错误：正确答案是“${quiz.correct}”`, `${quiz.explanation} 此次将扣除 15 点安全值。`);
    applyImpact(-15, quiz.caseId, prepareContinue);
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
  if (card.effect === "detention") {
    player.position = 20;
    player.detained = true;
  }
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

function turnContinueText() { return state.extraRoll ? "奖励生效！处理完毕后再掷一次" : "完成处理，交给下一位"; }

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
    $("#turnPrompt").textContent = "平安奖励生效：可以再掷一次骰子。";
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
