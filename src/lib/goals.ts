// 王伯達〈人生財務規劃學〉作業 1：財務目標試算表（1-2～1-4、4-5、5-3）。
// 每年一列：結餘 = 薪資 + 投資收入 − 生活費 − 居住 − 其他開銷；累積結存逐年滾動。

export interface LumpExpense {
  age: number;
  amount: number;
  label: string;
}

export interface GoalInputs {
  currentAge: number;
  retireAge: number;
  lifeExpectancy: number;
  annualSalary: number;
  salaryGrowth: number; // 例 0.02
  salaryPeakAge: number; // 之後薪資停止成長
  savings: number;
  returnRate: number;
  monthlyLiving: number;
  inflation: number; // 生活費通膨，課程用 1.5%
  monthlyRent: number;
  buyHouse: boolean;
  houseAge: number;
  housePrice: number;
  downPaymentRatio: number;
  mortgageRate: number;
  mortgageYears: number;
  lumpExpenses: LumpExpense[];
}

export interface YearRow {
  age: number;
  salary: number;
  investIncome: number;
  living: number;
  housing: number;
  other: number;
  net: number;
  balance: number;
  savingsRate: number | null; // 當年結餘 ÷ 當年收入
  withdrawalRate: number | null; // 退休後：當年支出 ÷ 年初累積結存
}

export interface GoalResult {
  rows: YearRow[];
  negativeAge: number | null;
  balanceAtRetire: number;
  retireNeed: number; // 退休首年支出 × 25（4% 法則）
  firstYearWithdrawalRate: number | null;
}

export const DEFAULT_INPUTS: GoalInputs = {
  currentAge: 30,
  retireAge: 65,
  lifeExpectancy: 85,
  annualSalary: 529_000,
  salaryGrowth: 0.02,
  salaryPeakAge: 50,
  savings: 1_000_000,
  returnRate: 0.05,
  monthlyLiving: 20_000,
  inflation: 0.015,
  monthlyRent: 12_000,
  buyHouse: true,
  houseAge: 40,
  housePrice: 11_000_000,
  downPaymentRatio: 0.2,
  mortgageRate: 0.02,
  mortgageYears: 20,
  lumpExpenses: [{ age: 40, amount: 2_000_000, label: "買車" }],
};

export function mortgagePayment(principal: number, rate: number, years: number) {
  if (principal <= 0 || years <= 0) return 0;
  if (rate === 0) return principal / years;
  return (principal * rate) / (1 - Math.pow(1 + rate, -years));
}

export function simulate(inp: GoalInputs): GoalResult {
  const rows: YearRow[] = [];
  let balance = inp.savings;
  let negativeAge: number | null = null;
  let balanceAtRetire = balance;
  let retireNeed = 0;
  let firstYearWithdrawalRate: number | null = null;
  const loan = inp.housePrice * (1 - inp.downPaymentRatio);
  const yearlyMortgage = mortgagePayment(loan, inp.mortgageRate, inp.mortgageYears);

  for (let age = inp.currentAge; age <= inp.lifeExpectancy; age++) {
    const t = age - inp.currentAge;
    const working = age < inp.retireAge;
    const growthYears = Math.max(0, Math.min(age, inp.salaryPeakAge) - inp.currentAge);
    const salary = working ? inp.annualSalary * Math.pow(1 + inp.salaryGrowth, growthYears) : 0;
    const startBalance = balance;
    const investIncome = startBalance * inp.returnRate;
    const living = inp.monthlyLiving * 12 * Math.pow(1 + inp.inflation, t);

    let housing = inp.monthlyRent * 12;
    if (inp.buyHouse && age >= inp.houseAge) {
      housing = age === inp.houseAge ? inp.housePrice * inp.downPaymentRatio : 0;
      if (age > inp.houseAge && age <= inp.houseAge + inp.mortgageYears) housing = yearlyMortgage;
    }

    const other = inp.lumpExpenses
      .filter((e) => e.age === age)
      .reduce((s, e) => s + e.amount, 0);

    const spending = living + housing + other;
    const net = salary + investIncome - spending;
    balance = startBalance + net;

    if (age === inp.retireAge) {
      balanceAtRetire = startBalance;
      retireNeed = spending * 25;
      firstYearWithdrawalRate = startBalance > 0 ? spending / startBalance : null;
    }
    if (negativeAge === null && balance < 0) negativeAge = age;

    const income = salary + investIncome;
    rows.push({
      age,
      salary,
      investIncome,
      living,
      housing,
      other,
      net,
      balance,
      savingsRate: working && income > 0 ? net / income : null,
      withdrawalRate: !working && startBalance > 0 ? spending / startBalance : null,
    });
  }

  return { rows, negativeAge, balanceAtRetire, retireNeed, firstYearWithdrawalRate };
}
