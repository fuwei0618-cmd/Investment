// 「如果……會怎樣？」：把〈15單元看懂經濟運行〉的因果鏈做成一步一步亮起來的情境。
// 只在課程有講時才寫時間差；fred 是那一步現在可以對照的數字卡。

export interface Link {
  text: string;
  fred?: string;
}

export interface Scenario {
  key: string;
  title: string;
  steps: Link[];
  so: string; // 所以投資人怎麼做
  course: string;
}

export const SCENARIOS: Scenario[] = [
  {
    key: "hike",
    title: "央行升息",
    steps: [
      { text: "央行升息，借錢變貴", fred: "FEDFUNDS" },
      { text: "房貸、車貸變重，買房買車的人變少" },
      { text: "工廠接到的訂單變少", fred: "INDPRO" },
      { text: "公司少請人，工作機會變少", fred: "PAYEMS" },
      { text: "大家少花錢，公司賺得少", fred: "RSAFS" },
      { text: "股價跟著往下走", fred: "SP500" },
    ],
    so: "升息初期股市通常還能漲；一路升到長短利差倒掛，就該開始提高現金。",
    course: "總經 3-1、3-7",
  },
  {
    key: "cut",
    title: "央行降息、印鈔",
    steps: [
      { text: "央行降息、買債，錢變便宜", fred: "FEDFUNDS" },
      { text: "存錢沒利息，錢跑去找股票和債券" },
      { text: "公債價格上漲（從第一次降息到下次升息前最好）" },
      { text: "美元偏弱，錢也流向新興市場", fred: "DTWEXBGS" },
      { text: "股票估值往上，股價上漲", fred: "SP500" },
    ],
    so: "寬鬆期勝率高；但如果經濟已經真的衰退、大家在丟工作，降息也擋不住下跌。",
    course: "總經 3-1、3-7",
  },
  {
    key: "oilUp",
    title: "油價衝過 60 美元",
    steps: [
      { text: "油價上漲", fred: "DCOILWTICO" },
      { text: "運輸和原料變貴，物價跟著漲", fred: "CPIAUCSL" },
      { text: "加油錢變多，其他東西就少買", fred: "RSAFS" },
      { text: "物價壓不下來，央行不敢降息、甚至升息", fred: "FEDFUNDS" },
    ],
    so: "油價太高是景氣後段的訊號，留意通膨和央行的態度。",
    course: "總經 3-6",
  },
  {
    key: "oilDown",
    title: "油價跌破 45 美元",
    steps: [
      { text: "油價大跌", fred: "DCOILWTICO" },
      { text: "通常代表全世界買的東西變少，需求出問題" },
      { text: "能源公司賺少、借錢多的公司壓力變大", fred: "BAMLH0A0HYM2" },
      { text: "物價下來，央行有空間降息", fred: "FEDFUNDS" },
    ],
    so: "油價太低不一定是好事，先確認是供給太多還是大家不買了。",
    course: "總經 3-6",
  },
  {
    key: "dollar",
    title: "美元變很強",
    steps: [
      { text: "美國利息比別國高，錢往美國跑", fred: "DTWEXBGS" },
      { text: "借美元的國家要還更多錢" },
      { text: "新興國家貨幣貶值、物價上漲，資金外逃" },
      { text: "油價用美元計價，跟著走弱", fred: "DCOILWTICO" },
      { text: "全球股市（美國以外）承壓" },
    ],
    so: "美元多頭時避開外債高、又常常入不敷出的國家（例如土耳其、阿根廷）。",
    course: "總經 3-1、3-5",
  },
  {
    key: "inventory",
    title: "倉庫堆滿貨",
    steps: [
      { text: "店裡賣不掉，倉庫堆貨", fred: "RSAFS" },
      { text: "先停止跟工廠下單", fred: "INDPRO" },
      { text: "台灣接的電子訂單、出口跟著變少" },
      { text: "台股和出口型國家先受傷" },
    ],
    so: "庫存循環大約 3–4 年一次，多半是小修正；等庫存去化完，訂單會回來。",
    course: "產業 2-1、總經 3-4",
  },
  {
    key: "jobs",
    title: "美國人開始丟工作",
    steps: [
      { text: "工作機會變少", fred: "PAYEMS" },
      { text: "薪水不漲、信心變差", fred: "UMCSENT" },
      { text: "大家少花錢", fred: "RSAFS" },
      { text: "公司賺少，再裁員", fred: "INDPRO" },
      { text: "股市下跌（美國就業轉壞才是大衰退）", fred: "SP500" },
    ],
    so: "就業是美國經濟的主人。工作一年增加不到 200 萬又一直往下，大約 2–3 個月後美股容易轉弱。",
    course: "總經 4-1、產業 2-1",
  },
];
