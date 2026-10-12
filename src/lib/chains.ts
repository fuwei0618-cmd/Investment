// 產業鏈資料：從「產業 → 公司 → 股票」一路看下去。
// 代表公司只是例子，不是推薦；資料為整理時（2026-10）的一般常識，未逐一查證財報。
// sector 必須等於 compassData.ts 裡 NEED_SECTORS 的 sector 字串。

export interface Company {
  name: string;
  ticker: string;
  market: "台" | "美" | "其他";
  note?: string;
}

export interface Segment {
  stage: "上游" | "中游" | "下游";
  name: string;
  does: string;
  why: string;
  trend: string;
  companies: Company[];
}

export interface Chain {
  key: string;
  title: string;
  sector: string;
  need: string;
  oneLine: string;
  segments: Segment[];
  threeQ: { big: string; moat: string; few: string };
  watch: string;
}

export const CHAINS: Chain[] = [
  {
    key: "semi-ai",
    title: "半導體與 AI",
    sector: "資訊科技",
    need: "用手機、電腦、晶片",
    oneLine: "從造晶片的機器，到設計、製造、包裝晶片，最後組成 AI 伺服器，一路接力完成。",
    segments: [
      {
        stage: "上游",
        name: "設備與材料",
        does: "賣「做晶片的機器」和「晶片的原料」，就像賣烤箱和麵粉給麵包店。",
        why: "沒有曝光機、蝕刻機和矽晶圓，再厲害的工廠也做不出晶片。",
        trend: "晶片越做越小，機器越來越貴、越難做，能做最先進機器的公司只剩少數幾家。",
        companies: [
          { name: "艾司摩爾", ticker: "ASML", market: "其他", note: "荷蘭，全球唯一能做 EUV 曝光機" },
          { name: "應用材料", ticker: "AMAT", market: "美" },
          { name: "科林研發", ticker: "LRCX", market: "美" },
          { name: "環球晶", ticker: "6488", market: "台", note: "矽晶圓" },
        ],
      },
      {
        stage: "中游",
        name: "IC 設計",
        does: "畫晶片的設計圖，像建築師只畫藍圖、不自己蓋房子。",
        why: "晶片要做什麼（算 AI、上網、拍照）全看設計，設計決定了晶片的價值。",
        trend: "AI 晶片需求大增，大型雲端公司也開始自己設計晶片，找設計服務公司幫忙。",
        companies: [
          { name: "輝達", ticker: "NVDA", market: "美", note: "AI 繪圖晶片龍頭" },
          { name: "超微", ticker: "AMD", market: "美" },
          { name: "博通", ticker: "AVGO", market: "美", note: "網通晶片、客製化 AI 晶片" },
          { name: "聯發科", ticker: "2454", market: "台", note: "手機晶片" },
          { name: "瑞昱", ticker: "2379", market: "台" },
        ],
      },
      {
        stage: "中游",
        name: "晶圓代工",
        does: "照著設計圖把晶片真正做出來，像幫別人蓋房子的營造廠。",
        why: "蓋一座先進晶圓廠要花上兆元台幣，設計公司自己蓋不起，只能交給代工廠。",
        trend: "最先進製程幾乎集中在台積電；各國政府補貼要在本國蓋廠。",
        companies: [
          { name: "台積電", ticker: "2330", market: "台", note: "全球最大晶圓代工" },
          { name: "聯電", ticker: "2303", market: "台", note: "成熟製程" },
          { name: "格羅方德", ticker: "GFS", market: "美" },
          { name: "三星電子", ticker: "005930", market: "其他", note: "韓國，也做記憶體" },
        ],
      },
      {
        stage: "中游",
        name: "封裝測試",
        does: "把做好的晶片切開、包上外殼、接好線，再測試能不能用，像幫商品裝盒並品管。",
        why: "裸晶片很脆弱又無法直接接電路板，沒包裝、沒測試就不能出貨。",
        trend: "AI 晶片要把好幾顆晶片疊在一起（先進封裝），封裝從配角變成關鍵技術。",
        companies: [
          { name: "日月光投控", ticker: "3711", market: "台", note: "全球最大封測廠" },
          { name: "艾克爾", ticker: "AMKR", market: "美" },
          { name: "京元電子", ticker: "2449", market: "台", note: "測試" },
        ],
      },
      {
        stage: "下游",
        name: "AI 伺服器組裝",
        does: "把晶片、電源、散熱、機殼組成一台台伺服器，像把零件組成一台電腦。",
        why: "雲端公司要的是能直接上線的整櫃機器，不是一顆顆晶片。",
        trend: "AI 伺服器越來越耗電、越熱，水冷散熱和整櫃組裝成為新重點。",
        companies: [
          { name: "鴻海", ticker: "2317", market: "台" },
          { name: "廣達", ticker: "2382", market: "台" },
          { name: "緯穎", ticker: "6669", market: "台" },
          { name: "戴爾", ticker: "DELL", market: "美" },
        ],
      },
    ],
    threeQ: {
      big: "AI、手機、汽車都要晶片，AI 帶動的需求成長快，符合年增 >10% 的條件，但景氣有循環。",
      moat: "先進製程、EUV 機器、AI 晶片的軟體生態都要十幾年累積，別人很難追。",
      few: "曝光機、先進代工、AI 晶片幾乎都由一兩家拿走大部分市場，是典型寡占。",
    },
    watch: "台積電每月營收與法說會的資本支出；輝達每季財報裡的資料中心營收。",
  },
  {
    key: "cloud-software",
    title: "雲端與網路軟體",
    sector: "資訊科技",
    need: "用手機、電腦、晶片",
    oneLine: "把電腦集中放在資料中心出租，再在上面跑各種軟體，讓大家用月費取代買電腦。",
    segments: [
      {
        stage: "上游",
        name: "資料中心硬體與電力",
        does: "提供資料中心的電源、散熱、網路交換器和機房空間，像蓋好倉庫並接上水電。",
        why: "成千上萬台伺服器要穩定供電、降溫、互相連線，任何一環斷掉服務就停擺。",
        trend: "AI 讓資料中心用電暴增，電源、散熱和電力設備變成瓶頸。",
        companies: [
          { name: "台達電", ticker: "2308", market: "台", note: "電源與散熱" },
          { name: "維諦技術", ticker: "VRT", market: "美", note: "資料中心電力散熱" },
          { name: "Arista Networks", ticker: "ANET", market: "美", note: "網路交換器" },
          { name: "Equinix", ticker: "EQIX", market: "美", note: "出租機房" },
        ],
      },
      {
        stage: "中游",
        name: "雲端平台",
        does: "把大量伺服器變成可以按用量租的「電腦水電」，企業要多少就租多少。",
        why: "企業自己買機器又貴又難管，租雲端比較省事，也能隨時加大。",
        trend: "企業把系統搬上雲還在持續，AI 運算又帶來新一波需求。",
        companies: [
          { name: "亞馬遜（AWS）", ticker: "AMZN", market: "美" },
          { name: "微軟（Azure）", ticker: "MSFT", market: "美" },
          { name: "Alphabet（Google Cloud）", ticker: "GOOGL", market: "美" },
          { name: "甲骨文", ticker: "ORCL", market: "美" },
        ],
      },
      {
        stage: "下游",
        name: "軟體服務（SaaS）",
        does: "在雲端上做好現成的軟體，讓公司用訂閱方式使用，像訂 Netflix 一樣訂辦公軟體。",
        why: "企業要記帳、管客戶、做設計，都需要軟體；訂閱制讓收入穩定。",
        trend: "各家軟體都在加入 AI 功能，但也擔心 AI 讓寫軟體變便宜、競爭變激烈。",
        companies: [
          { name: "Salesforce", ticker: "CRM", market: "美", note: "客戶管理軟體" },
          { name: "Adobe", ticker: "ADBE", market: "美", note: "設計軟體" },
          { name: "ServiceNow", ticker: "NOW", market: "美" },
        ],
      },
    ],
    threeQ: {
      big: "雲端與 AI 運算持續成長，大致符合年增 >10%。",
      moat: "資料中心規模、客戶資料放上去後很難搬走（轉換成本高）。",
      few: "雲端平台主要由亞馬遜、微軟、Google 三家瓜分，寡占明顯；SaaS 則各領域各有龍頭。",
    },
    watch: "三大雲端每季營收成長率；它們公布的資本支出（蓋資料中心的錢）。",
  },
  {
    key: "telecom-media",
    title: "通訊、網路平台與內容",
    sector: "通訊服務",
    need: "聊天、上網、看影片",
    oneLine: "電信公司鋪好網路的「路」，平台公司在路上開「商場」，內容公司提供「節目」。",
    segments: [
      {
        stage: "上游",
        name: "網通設備",
        does: "做讓資料在網路上跑的設備，例如交換器、路由器，像高速公路的交流道。",
        why: "沒有這些設備，手機和電腦就無法互相連線。",
        trend: "AI 資料中心需要更快的網路，高速交換器需求增加。",
        companies: [
          { name: "思科", ticker: "CSCO", market: "美" },
          { name: "智邦", ticker: "2345", market: "台", note: "交換器" },
        ],
      },
      {
        stage: "中游",
        name: "電信業者",
        does: "鋪設基地台和光纖，賣手機網路與家用寬頻，像收過路費的高速公路公司。",
        why: "所有上網、通話都要經過電信網路，是生活必需。",
        trend: "用戶數成長有限，靠 5G、企業專網和資費調整慢慢成長，股利穩定。",
        companies: [
          { name: "中華電信", ticker: "2412", market: "台" },
          { name: "台灣大", ticker: "3045", market: "台" },
          { name: "遠傳", ticker: "4904", market: "台" },
          { name: "威訊", ticker: "VZ", market: "美" },
          { name: "T-Mobile US", ticker: "TMUS", market: "美" },
        ],
      },
      {
        stage: "下游",
        name: "網路平台",
        does: "經營搜尋、社群、影音平台，免費給大家用，再向廣告主收錢。",
        why: "大家每天花很多時間在上面，廣告主自然要去那裡打廣告。",
        trend: "AI 正在改變搜尋與廣告的方式，平台競相投入 AI。",
        companies: [
          { name: "Alphabet（Google、YouTube）", ticker: "GOOGL", market: "美" },
          { name: "Meta（Facebook、Instagram）", ticker: "META", market: "美" },
          { name: "騰訊", ticker: "0700", market: "其他", note: "香港上市" },
        ],
      },
      {
        stage: "下游",
        name: "影音與娛樂內容",
        does: "製作或收集影片、音樂、遊戲，用訂閱或授權賺錢。",
        why: "網路再快，沒有好看的內容大家也不會付錢。",
        trend: "串流平台從搶用戶轉向追求獲利，加入廣告方案、打擊共用帳號。",
        companies: [
          { name: "Netflix", ticker: "NFLX", market: "美" },
          { name: "迪士尼", ticker: "DIS", market: "美" },
          { name: "Spotify", ticker: "SPOT", market: "美" },
        ],
      },
    ],
    threeQ: {
      big: "電信成長慢（不到 10%），網路廣告和串流較快，要分開看。",
      moat: "電信有執照和基地台；平台有大量用戶，人越多越難被取代（網路效應）。",
      few: "台灣電信三雄、全球網路廣告由 Google 和 Meta 拿大半，都偏寡占。",
    },
    watch: "電信看每用戶平均營收（ARPU）；平台看廣告營收成長；串流看訂閱人數。",
  },
  {
    key: "ev",
    title: "電動車",
    sector: "非必需消費",
    need: "想玩、想買好東西",
    oneLine: "從挖鋰礦、做電池，到做馬達電控零件，最後組成一台電動車賣給你。",
    segments: [
      {
        stage: "上游",
        name: "電池原料",
        does: "開採並提煉鋰、鎳等礦物，是電池的「食材」。",
        why: "電池是電動車最貴的零件，而原料決定電池能不能做出來。",
        trend: "原料價格起伏很大，曾大漲後又大跌，是景氣循環最明顯的一段。",
        companies: [
          { name: "雅保", ticker: "ALB", market: "美", note: "鋰" },
          { name: "智利化工", ticker: "SQM", market: "美", note: "智利公司，在美上市" },
        ],
      },
      {
        stage: "中游",
        name: "動力電池",
        does: "把原料做成電池芯和電池組，等於電動車的「油箱」。",
        why: "續航力、充電速度、價格大多取決於電池。",
        trend: "中國廠商規模最大、價格最便宜；各國想在本地建電池廠降低依賴。",
        companies: [
          { name: "寧德時代", ticker: "300750", market: "其他", note: "中國，全球最大電池廠" },
          { name: "LG 新能源", ticker: "373220", market: "其他", note: "韓國" },
          { name: "松下", ticker: "6752", market: "其他", note: "日本" },
        ],
      },
      {
        stage: "中游",
        name: "零組件（電控、功率晶片、線束）",
        does: "做讓電池的電變成車子動力的零件，像車子的神經和肌肉。",
        why: "電動車沒有引擎，改靠馬達、電控和功率晶片，這些零件不可或缺。",
        trend: "車子越來越像電腦，車用晶片與電子零件的含量持續增加。",
        companies: [
          { name: "台達電", ticker: "2308", market: "台", note: "電動車電源零件" },
          { name: "貿聯-KY", ticker: "3665", market: "台", note: "線束" },
          { name: "安森美", ticker: "ON", market: "美", note: "功率晶片" },
          { name: "英飛凌", ticker: "IFX", market: "其他", note: "德國，車用晶片" },
        ],
      },
      {
        stage: "下游",
        name: "整車品牌",
        does: "設計、組裝並賣出整台車，是消費者看得到的品牌。",
        why: "最後要有人把所有零件組成車、建立品牌和銷售通路。",
        trend: "價格戰激烈，中國品牌崛起；自動駕駛和車上軟體是下一個戰場。",
        companies: [
          { name: "特斯拉", ticker: "TSLA", market: "美" },
          { name: "比亞迪", ticker: "1211", market: "其他", note: "香港上市" },
          { name: "豐田汽車", ticker: "TM", market: "美", note: "日本公司，美國存託憑證" },
        ],
      },
    ],
    threeQ: {
      big: "電動車滲透率還在上升，但各國補貼政策一變，成長速度就會起伏。",
      moat: "電池技術、規模成本和自駕軟體是護城河，純組裝的門檻較低。",
      few: "電池偏寡占（寧德時代、比亞迪、LG 等）；整車品牌很多，價格戰激烈，不算寡占。",
    },
    watch: "每月或每季電動車交車量；碳酸鋰價格。",
  },
  {
    key: "healthcare",
    title: "醫療保健",
    sector: "醫療保健",
    need: "生病、看醫生",
    oneLine: "從實驗室研發、工廠做藥和醫材，到醫院、藥局、保險把醫療送到病人手上。",
    segments: [
      {
        stage: "上游",
        name: "研發工具與委託製造",
        does: "賣實驗儀器和試劑，或幫藥廠代工做藥，像賣工具和代工廚房給大廚。",
        why: "新藥要經過多年實驗和大量生產，藥廠需要這些工具和代工夥伴。",
        trend: "藥廠越來越常把研發和生產外包，代工（CDMO）需求增加。",
        companies: [
          { name: "賽默飛世爾", ticker: "TMO", market: "美", note: "實驗儀器" },
          { name: "保瑞", ticker: "6472", market: "台", note: "藥品代工" },
        ],
      },
      {
        stage: "中游",
        name: "藥廠與生技",
        does: "研發並生產藥品，新藥有專利保護期間可以賣高價。",
        why: "治病最終要靠藥，沒有藥廠就沒有新療法。",
        trend: "減重藥（GLP-1）大熱門；各國政府持續施壓降低藥價，專利到期也會讓營收下滑。",
        companies: [
          { name: "禮來", ticker: "LLY", market: "美", note: "減重、糖尿病藥" },
          { name: "諾和諾德", ticker: "NVO", market: "美", note: "丹麥公司，美國存託憑證" },
          { name: "嬌生", ticker: "JNJ", market: "美" },
          { name: "默沙東", ticker: "MRK", market: "美" },
          { name: "藥華藥", ticker: "6446", market: "台" },
        ],
      },
      {
        stage: "中游",
        name: "醫療器材",
        does: "做手術機器人、心臟支架、隱形眼鏡等醫療用品與設備。",
        why: "看病、開刀、檢查都需要器材，有些還要定期更換耗材。",
        trend: "人口老化帶動需求；微創手術和機器人手術越來越普遍。",
        companies: [
          { name: "直覺手術", ticker: "ISRG", market: "美", note: "達文西手術機器人" },
          { name: "美敦力", ticker: "MDT", market: "美" },
          { name: "晶碩", ticker: "6491", market: "台", note: "隱形眼鏡" },
        ],
      },
      {
        stage: "下游",
        name: "醫療服務、通路與保險",
        does: "經營醫療保險、藥局、診所，把藥和服務送到病人手上。",
        why: "病人要有地方看病、拿藥，也需要保險分擔費用。",
        trend: "美國醫療保險受政府政策影響大；台灣連鎖藥局持續展店。",
        companies: [
          { name: "聯合健康", ticker: "UNH", market: "美", note: "美國最大醫療保險" },
          { name: "CVS Health", ticker: "CVS", market: "美", note: "藥局與保險" },
          { name: "大樹", ticker: "6469", market: "台", note: "連鎖藥局" },
        ],
      },
    ],
    threeQ: {
      big: "人口老化讓需求穩定成長，整體成長不快，但熱門藥物（如減重藥）可能年增 >10%。",
      moat: "新藥專利、法規認證、醫生用習慣的器材，都讓別人很難搶。",
      few: "特定藥物或器材常由一兩家獨占（例如手術機器人），整個產業則公司很多。",
    },
    watch: "重要新藥的臨床試驗結果與核准；美國藥價政策的新聞。",
  },
  {
    key: "energy",
    title: "能源（石油天然氣與綠能）",
    sector: "能源",
    need: "開車、發電要油氣",
    oneLine: "從地底挖出油氣，用管線運送，再煉成汽油賣出；同時綠能正慢慢加入發電。",
    segments: [
      {
        stage: "上游",
        name: "探勘與生產",
        does: "找油田、鑽井，把石油和天然氣從地底抽出來，像挖礦。",
        why: "所有汽油、塑膠、很多電力的源頭都是這裡。",
        trend: "賺多少幾乎跟著油價走；大公司更重視股利和買回股票，而不是一直擴產。",
        companies: [
          { name: "埃克森美孚", ticker: "XOM", market: "美" },
          { name: "雪佛龍", ticker: "CVX", market: "美" },
          { name: "康菲石油", ticker: "COP", market: "美" },
          { name: "沙烏地阿美", ticker: "2222", market: "其他", note: "沙烏地上市" },
        ],
      },
      {
        stage: "中游",
        name: "管線運輸與儲存",
        does: "用管線、儲槽把油氣從產地送到工廠，像收過路費的輸送帶。",
        why: "油田常離城市很遠，沒有管線就送不出去。",
        trend: "收入多按運量收費，比較不受油價影響，以穩定配息著稱；天然氣出口增加。",
        companies: [
          { name: "安橋", ticker: "ENB", market: "美", note: "加拿大公司，也在美上市" },
          { name: "金德摩根", ticker: "KMI", market: "美" },
          { name: "威廉斯", ticker: "WMB", market: "美" },
        ],
      },
      {
        stage: "下游",
        name: "煉油與石化",
        does: "把原油煉成汽油、柴油和塑膠原料，再賣給加油站和工廠。",
        why: "原油不能直接用，一定要經過煉製。",
        trend: "賺的是「原油和成品的價差」，景氣好壞變化大；電動車普及長期會壓抑汽油需求。",
        companies: [
          { name: "台塑化", ticker: "6505", market: "台" },
          { name: "馬拉松石油", ticker: "MPC", market: "美" },
          { name: "瓦萊羅", ticker: "VLO", market: "美" },
        ],
      },
      {
        stage: "下游",
        name: "綠能與電網設備",
        does: "用太陽能、風力發電，並製造變壓器等電網設備把電送出去。",
        why: "各國要減碳，加上 AI 用電大增，需要更多電力和更強的電網。",
        trend: "長期持續成長，但受政策補貼和利率影響大；電網設備需求強。",
        companies: [
          { name: "新紀元能源", ticker: "NEE", market: "美", note: "美國最大再生能源發電之一" },
          { name: "First Solar", ticker: "FSLR", market: "美", note: "太陽能板" },
          { name: "華城", ticker: "1519", market: "台", note: "變壓器" },
          { name: "世紀鋼", ticker: "9958", market: "台", note: "離岸風電水下基礎" },
        ],
      },
    ],
    threeQ: {
      big: "石油需求接近成熟，成長慢；綠能與電網設備較有機會年增 >10%。",
      moat: "油田蘊藏量、管線路權、大型煉油廠都是很難複製的資產。",
      few: "管線和大型煉油常是地區寡占；綠能發電業者多，競爭較激烈。",
    },
    watch: "國際油價（布蘭特、西德州原油）；OPEC+ 減產或增產的決定。",
  },
  {
    key: "finance",
    title: "金融",
    sector: "金融",
    need: "借錢、存錢、保險",
    oneLine: "把大家存的錢、保費集中起來，借出去或拿去投資賺利差，再提供付款服務。",
    segments: [
      {
        stage: "上游",
        name: "銀行（資金來源）",
        does: "收大家的存款，再借給要買房、開公司的人，賺中間的利息差。",
        why: "沒有銀行，存款沒地方放，企業和個人也很難借到錢。",
        trend: "利率高時利差較大、銀行較好賺；利率下降時利差會縮小。",
        companies: [
          { name: "摩根大通", ticker: "JPM", market: "美" },
          { name: "美國銀行", ticker: "BAC", market: "美" },
          { name: "中信金", ticker: "2891", market: "台" },
          { name: "兆豐金", ticker: "2886", market: "台" },
          { name: "玉山金", ticker: "2884", market: "台" },
        ],
      },
      {
        stage: "中游",
        name: "保險",
        does: "收保費，承諾發生意外或生病時賠錢；收來的保費先拿去投資。",
        why: "人生有風險，保險幫大家把大損失分攤掉。",
        trend: "壽險獲利很看股市和債市表現；會計新制（IFRS 17）讓財報看法改變。",
        companies: [
          { name: "國泰金", ticker: "2882", market: "台" },
          { name: "富邦金", ticker: "2881", market: "台" },
          { name: "波克夏海瑟威", ticker: "BRK.B", market: "美", note: "巴菲特的公司，保險是核心" },
        ],
      },
      {
        stage: "中游",
        name: "資產管理與證券",
        does: "幫大家管理基金、ETF，或提供買賣股票的服務，收管理費和手續費。",
        why: "一般人沒時間自己挑股票，需要專業機構和交易管道。",
        trend: "便宜的 ETF 越來越受歡迎，規模大的資產管理公司越大越有優勢。",
        companies: [
          { name: "貝萊德", ticker: "BLK", market: "美", note: "全球最大資產管理" },
          { name: "元大金", ticker: "2885", market: "台", note: "證券、ETF" },
        ],
      },
      {
        stage: "下游",
        name: "支付",
        does: "讓你刷卡、手機付款時，錢能從你的帳戶安全送到店家，每筆抽一點手續費。",
        why: "每天的消費都要付款，支付網路是買賣的「收銀台」。",
        trend: "現金越用越少，電子支付持續成長；但也面臨新支付方式和法規的挑戰。",
        companies: [
          { name: "Visa", ticker: "V", market: "美" },
          { name: "萬事達卡", ticker: "MA", market: "美" },
          { name: "PayPal", ticker: "PYPL", market: "美" },
        ],
      },
    ],
    threeQ: {
      big: "銀行保險成長慢，跟著經濟走；電子支付成長較快。",
      moat: "金融執照、客戶信任、支付網路（越多人用越有價值）。",
      few: "信用卡支付幾乎由 Visa 和萬事達卡寡占；銀行與保險公司多，競爭較分散。",
    },
    watch: "央行利率決策；金控每月公布的自結獲利。",
  },
  {
    key: "staples",
    title: "必需消費（食品與日用品）",
    sector: "必需消費",
    need: "吃喝、日用品",
    oneLine: "從穀物、肉品原料，到做成有品牌的食品日用品，最後放上超商量販的貨架。",
    segments: [
      {
        stage: "上游",
        name: "農產與食品原料",
        does: "收購、加工穀物、飼料、肉品，提供食品工廠原料。",
        why: "所有食品飲料都要從農產品開始。",
        trend: "賺多少受天氣和原物料價格影響，屬於薄利、看規模的生意。",
        companies: [
          { name: "ADM", ticker: "ADM", market: "美", note: "穀物加工" },
          { name: "大成", ticker: "1210", market: "台", note: "飼料、雞肉" },
          { name: "卜蜂", ticker: "1215", market: "台", note: "飼料、雞肉" },
        ],
      },
      {
        stage: "中游",
        name: "品牌製造",
        does: "把原料做成可樂、泡麵、洗髮精，打上大家熟悉的品牌。",
        why: "消費者認品牌買東西，品牌讓產品能賣比較貴、比較穩。",
        trend: "成長慢但穩；原料漲價時，品牌強的公司比較能把成本轉嫁給消費者。",
        companies: [
          { name: "統一", ticker: "1216", market: "台" },
          { name: "可口可樂", ticker: "KO", market: "美" },
          { name: "寶僑", ticker: "PG", market: "美", note: "洗髮精、洗衣精等" },
          { name: "雀巢", ticker: "NESN", market: "其他", note: "瑞士上市" },
        ],
      },
      {
        stage: "下游",
        name: "通路（超商、量販）",
        does: "開店把商品賣給你，像社區裡的大冰箱和大倉庫。",
        why: "品牌商品要有貨架才賣得出去，通路掌握和消費者見面的機會。",
        trend: "網購搶市，大型量販和會員制（如 Costco）勝出；超商靠鮮食和服務成長。",
        companies: [
          { name: "統一超", ticker: "2912", market: "台", note: "7-ELEVEN" },
          { name: "全家", ticker: "5903", market: "台", note: "上櫃" },
          { name: "好市多", ticker: "COST", market: "美" },
          { name: "沃爾瑪", ticker: "WMT", market: "美" },
        ],
      },
    ],
    threeQ: {
      big: "跟著人口成長，大約只長幾%，通常達不到年增 >10%，優點是抗衰退。",
      moat: "品牌、通路據點與規模採購的成本優勢。",
      few: "飲料、日用品、超商常由少數大品牌或大通路瓜分，屬寡占。",
    },
    watch: "同店銷售成長率；原物料（如糖、穀物）價格變化。",
  },
  {
    key: "industrial",
    title: "工業與原物料（從鋼鐵到運輸）",
    sector: "工業",
    need: "蓋工廠、造機器、運貨",
    oneLine: "先有鋼鐵等原料，做成機器和自動化設備蓋工廠，最後靠船、鐵路、快遞把貨運出去。",
    segments: [
      {
        stage: "上游",
        name: "鋼鐵與礦產原料",
        does: "挖鐵礦、煉鋼，提供蓋房子、造機器的基本材料。",
        why: "大樓、橋樑、汽車、機器都需要鋼鐵。",
        trend: "價格跟著全球景氣（尤其中國需求）大起大落，是典型景氣循環股。",
        companies: [
          { name: "中鋼", ticker: "2002", market: "台" },
          { name: "紐柯鋼鐵", ticker: "NUE", market: "美" },
          { name: "必和必拓", ticker: "BHP", market: "美", note: "澳洲礦業，美國存託憑證" },
        ],
      },
      {
        stage: "中游",
        name: "機械與自動化",
        does: "做挖土機、工具機、機器手臂的零件，幫工廠和工地做事。",
        why: "蓋工廠、做產品都要靠機器，人工越貴越需要自動化。",
        trend: "缺工和各國把工廠搬回本國，帶動自動化需求；但訂單仍受景氣影響。",
        companies: [
          { name: "開拓重工", ticker: "CAT", market: "美", note: "挖土機" },
          { name: "西門子", ticker: "SIE", market: "其他", note: "德國，工業自動化" },
          { name: "上銀", ticker: "2049", market: "台", note: "線性滑軌" },
          { name: "亞德客-KY", ticker: "1590", market: "台", note: "氣動元件" },
        ],
      },
      {
        stage: "下游",
        name: "運輸物流",
        does: "用貨櫃船、鐵路、飛機和快遞把貨送到世界各地。",
        why: "東西做好了，還要送到買家手上才算完成。",
        trend: "運費波動很大，疫情和航道中斷時曾暴漲；電商讓包裹量長期增加。",
        companies: [
          { name: "長榮", ticker: "2603", market: "台", note: "貨櫃航運" },
          { name: "陽明", ticker: "2609", market: "台", note: "貨櫃航運" },
          { name: "聯合太平洋", ticker: "UNP", market: "美", note: "鐵路" },
          { name: "優比速", ticker: "UPS", market: "美", note: "快遞" },
        ],
      },
    ],
    threeQ: {
      big: "整體跟著經濟成長，平時不到 10%；自動化、電網等子題較快。",
      moat: "大型設備的技術與品牌、鐵路路網、礦場資源都很難複製。",
      few: "鐵路、重型機械常是寡占；航運和鋼鐵公司較多，價格戰明顯。",
    },
    watch: "製造業 PMI（採購經理人指數）；貨櫃運價指數（如 SCFI）。",
  },
];

export const chainsOfSector = (sector: string) => CHAINS.filter((c) => c.sector === sector);
