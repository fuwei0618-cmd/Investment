// 產業情境圖：用「你的一天」串起所有產業。每個場景＝你花的一塊錢，背後流進哪些公司。
// 公司只是例子，不是推薦。chain 對應 chains.ts 的 key，sector 對應 NEED_SECTORS 的 sector。

export interface Scene {
  time: string;
  icon: string;
  you: string; // 你在做什麼
  behind: string; // 背後發生什麼
  flow: { step: string; who: string }[]; // 錢從你手上往上游流
  chain: string;
  sector: string;
}

export const SCENES: Scene[] = [
  {
    time: "07:00",
    icon: "🍳",
    you: "起床刷牙、在超商買早餐",
    behind: "牙膏、麵包、牛奶天天要用，景氣差也照買，所以這類公司賺得穩、長得慢。",
    flow: [
      { step: "你付錢的地方", who: "統一超、全聯、Costco" },
      { step: "做成商品的品牌", who: "統一、雀巢、寶僑、可口可樂" },
      { step: "原料", who: "小麥、牛奶、糖、棕櫚油的農企業" },
    ],
    chain: "staples",
    sector: "必需消費",
  },
  {
    time: "08:00",
    icon: "🚗",
    you: "開車或騎車上班、加油或充電",
    behind: "汽油來自地底的油氣；電動車則把錢從加油站移到電池和電廠。油價一漲，運輸和物價都跟著動。",
    flow: [
      { step: "你付錢的地方", who: "台塑石化加油站、特斯拉充電站" },
      { step: "車子與電池", who: "特斯拉、比亞迪、寧德時代、台達電" },
      { step: "油氣與原料", who: "埃克森美孚、雪佛龍、鋰礦公司" },
    ],
    chain: "ev",
    sector: "非必需消費",
  },
  {
    time: "09:30",
    icon: "💻",
    you: "上班打開電腦，問 AI 一個問題",
    behind: "你按下送出的那一秒，問題飛到美國的資料中心，在一整櫃 AI 晶片上算完再傳回來。這是現在最熱的一條鏈。",
    flow: [
      { step: "你用的服務", who: "微軟、Google、OpenAI（多半月費）" },
      { step: "出租電腦的資料中心", who: "微軟 Azure、亞馬遜 AWS、Google 雲" },
      { step: "AI 伺服器", who: "鴻海、廣達、緯穎組裝；輝達設計晶片" },
      { step: "晶片製造", who: "台積電代工、日月光封裝" },
      { step: "造晶片的機器", who: "艾司摩爾、應用材料" },
    ],
    chain: "semi-ai",
    sector: "資訊科技",
  },
  {
    time: "12:30",
    icon: "📱",
    you: "午休滑手機、看影片、傳訊息",
    behind: "你看的每一則廣告都是平台的收入；電信公司則收你每個月的網路費。",
    flow: [
      { step: "你花時間的地方", who: "YouTube、IG、Netflix、LINE" },
      { step: "靠廣告和訂閱賺錢的平台", who: "Google、Meta、Netflix" },
      { step: "網路的「路」", who: "中華電信、台灣大、遠傳" },
    ],
    chain: "telecom-media",
    sector: "通訊服務",
  },
  {
    time: "14:00",
    icon: "🏭",
    you: "你沒看到的地方：工廠在做東西、貨櫃在海上跑",
    behind: "所有商品都要先有鋼鐵、機器和運輸。景氣一好，工廠擴產、運費上漲，這群公司最先感覺到。",
    flow: [
      { step: "把貨送到你手上", who: "長榮海運、UPS、聯邦快遞" },
      { step: "機器與自動化", who: "卡特彼勒、西門子、上銀" },
      { step: "原料", who: "中鋼、紐柯鋼鐵" },
    ],
    chain: "industrial",
    sector: "工業",
  },
  {
    time: "16:00",
    icon: "🏥",
    you: "身體不舒服，去診所看醫生、拿藥",
    behind: "生病不會因為景氣差就不看，而且人越老看得越多，所以醫療是長期跟著人口老化成長的產業。",
    flow: [
      { step: "你付錢的地方", who: "醫院、藥局、健保與保險" },
      { step: "藥和醫療器材", who: "禮來、輝瑞、嬌生、美敦力" },
      { step: "研發與代工", who: "生技公司、藥品代工廠" },
    ],
    chain: "healthcare",
    sector: "醫療保健",
  },
  {
    time: "18:30",
    icon: "💳",
    you: "刷卡買晚餐，薪水存進銀行",
    behind: "銀行把大家存的錢借出去賺利息差；你刷的每一筆卡，發卡和收單公司都抽一點點。利率高低直接影響它們賺多少。",
    flow: [
      { step: "你刷的卡、存的錢", who: "國泰金、富邦金、中信金" },
      { step: "付款網路", who: "Visa、萬事達卡" },
      { step: "保險與投資", who: "保險公司、資產管理公司" },
    ],
    chain: "finance",
    sector: "金融",
  },
  {
    time: "22:00",
    icon: "💡",
    you: "回家開冷氣、手機充電",
    behind: "電要從天然氣、煤、太陽能、風力變出來。AI 資料中心越蓋越多，用電大增，發電和電網也跟著被需要。",
    flow: [
      { step: "你付電費的地方", who: "台電、美國電力公司" },
      { step: "發電與綠能設備", who: "奇異維諾瓦、第一太陽能、台達電" },
      { step: "燃料", who: "天然氣與煤的公司" },
    ],
    chain: "energy",
    sector: "能源",
  },
];
