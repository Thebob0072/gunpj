// Official Budget Allocation for Fiscal Year 2569
// Source: Ordinance No. 69-1 Budget Act, Nakhon Ratchasima Municipality

export interface BudgetAllocation {
  id: string;
  category: string;
  thai_name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  description: string;
  usage: string[];
  funding_source?: string;
}

export const MUNICIPALITY_FINANCIAL_SUMMARY = {
  bankDeposits: 2048035978.79,
  accumulatedFunds: 2502143265.77,
  totalReserves: 4550179244.56, // Total liquid assets
  annualBudget: 1645781000, // FY 2569 operating budget
  fiscalYear: 2569,
  municipality: 'เทศบาลนครนครราชสีมา',
  pdfReference: 13, // Page reference in ordinance69-1.pdf
};

export const BUDGET_ALLOCATION: BudgetAllocation[] = [
  {
    id: 'PER',
    category: 'Personnel Budget',
    thai_name: 'งบบุคลากร',
    amount: 530818000,
    percentage: 32.3,
    color: '#f97316', // Orange
    icon: '👥',
    description: 'เงินเดือน ค่าจ้างลูกจ้าง เงินประจำตำแหน่ง และเงินเพิ่มต่างๆ',
    usage: [
      'เงินเดือนข้าราชการ',
      'ค่าจ้างลูกจ้างประจำ',
      'เงินประจำตำแหน่ง',
      'เงินเพิ่มพิเศษต่างๆ',
      'เบี้ยเลี้ยงเหมาจ่ายและค่าเบี้ยยังชีพ'
    ],
    funding_source: 'เงินรายได้ของเทศบาล'
  },
  {
    id: 'CEN',
    category: 'Central Budget',
    thai_name: 'งบกลาง',
    amount: 455456300,
    percentage: 27.7,
    color: '#8b5cf6', // Purple
    icon: '💰',
    description: 'เงินสมทบกองทุน บำนาญ สวัสดิการ และเงินสำรองฉุกเฉิน',
    usage: [
      'เงินสมทบกองทุนสวัสดิการ',
      'เบี้ยยังชีพผู้สูงอายุ (800 บาท/เดือน)',
      'เงินสมทบผู้พิการ',
      'เงินสำรองจ่ายฉุกเฉิน (15 ล้านบาท)',
      'เงินอุดหนุนต่างๆ'
    ],
    funding_source: 'เงินรายได้ของเทศบาล'
  },
  {
    id: 'OPR',
    category: 'Operating Budget',
    thai_name: 'งบดำเนินงาน',
    amount: 402867500,
    percentage: 24.5,
    color: '#06b6d4', // Cyan
    icon: '⚙️',
    description: 'ค่าตอบแทน ค่าใช้สอย และค่าวัสดุในการทำงาน',
    usage: [
      'ค่าตอบแทนเพิ่มเติม (เบี้ยเลี้ยง/โอที)',
      'ค่าจ้างเหมาบริการ',
      'จัดอีเวนท์ (กิจกรรม งานเลี้ยง)',
      'ค่าวัสดุสำนักงาน (กระดาษ ปากกา อุปกรณ์)',
      'ค่าน้ำ ค่าไฟ ค่าโทรศัพท์ ค่าเบี้ยประกัน',
      '⚠️ งบดูแลสัตว์จรจัด 20,000 บาท ซ่อนอยู่ที่นี่'
    ],
    funding_source: 'เงินรายได้ของเทศบาล'
  },
  {
    id: 'CAP',
    category: 'Capital Investment',
    thai_name: 'งบลงทุน',
    amount: 197031000,
    percentage: 12.0,
    color: '#10b981', // Green
    icon: '🏗️',
    description: 'ที่ดิน สิ่งก่อสร้าง ถนน และครุภัณฑ์ขนาดใหญ่',
    usage: [
      'ปรับปรุงถนน ทางเท้า (⚠️ 40.3 ล้านบาท)',
      'สิ่งก่อสร้างและปรับปรุงอาคารสำนักงาน',
      'จัดซื้อครุภัณฑ์ (จอทีวี โน้ตบุ๊ก รถยนต์)',
      'ระบบสาธารณูปโภค (น้ำ ไฟฟ้า)',
      'โครงการพัฒนาข้างต้นต้องอยู่ใน "ยุทธศาสตร์การพัฒนา"'
    ],
    funding_source: 'เงินรายได้ของเทศบาล'
  },
  {
    id: 'GRA',
    category: 'Grants & Subsidies',
    thai_name: 'งบเงินอุดหนุน',
    amount: 59358200,
    percentage: 3.6,
    color: '#ec4899', // Pink
    icon: '🎓',
    description: 'อุดหนุนให้หน่วยงานอื่น สถาบันการศึกษา และชุมชน',
    usage: [
      'อุดหนุนอาหารกลางวันเด็กเล็ก',
      'อุดหนุนโรงเรียน (อุดหนุนส่วนกลาง)',
      'อุดหนุนโครงการชุมชน',
      'อุดหนุนองค์กรสาธารณะประโยชน์'
    ],
    funding_source: 'เงินรายได้ของเทศบาล'
  },
  {
    id: 'OTH',
    category: 'Other Expenditure',
    thai_name: 'งบรายจ่ายอื่น',
    amount: 250000,
    percentage: 0.02,
    color: '#6b7280', // Gray
    icon: '📋',
    description: 'รายจ่ายที่ไม่เข้าข่ายหมวดอื่นๆ',
    usage: [
      'ค่าปรับล่าช้า',
      'ค่าลอยแพ ค่าเสื่อมราคา',
      'รายจ่ายอื่นๆ ตามพระราชกฤษฎีกา'
    ],
    funding_source: 'เงินรายได้ของเทศบาล'
  }
];

export const BUDGET_INSIGHTS = {
  staffCostRatio: 32.3, // Percentage of personnel costs
  centralBudgetRatio: 27.7, // Mandatory social security payments
  operatingRatio: 24.5, // Day-to-day operations
  capitalInvestmentRatio: 12.0, // Long-term infrastructure
  insight_1: {
    title: 'หนึ่งในสามของงบประมาณไปกับเงินเดือน',
    description: 'เนื่องจากเทศบาลมีข้าราชการประจำประมาณ 550+ คน งบบุคลากร (530.8 ล้านบาท) จึงกินสัดส่วนไปเกือบ 1 ใน 3 ของงบทั้งหมด',
    value: '530.8 ล้านบาท (32.3%)'
  },
  insight_2: {
    title: 'งบกลาง + บุคลากร = 60% ของงบประมาณ',
    description: 'เมื่อรวมงบเดือที่ถูกจ่ายจำเป็น (ค่าจ้าง + เบี้ยยังชีพ + สมทบกองทุน) จะเหลืองบให้ทำงานจริงและลงทุนเพียง 40% เท่านั้น',
    value: '986.3 ล้านบาท (60%)'
  },
  insight_3: {
    title: '3 เส้นทางทางเท้า vs สัตว์จรจัด',
    description: 'งบปรับปรุงทางเท้า 3 เส้นทางใช้ไป 40.3 ล้านบาท แต่งบดูแลสัตว์เพียง 20,000 บาท = อัตราส่วน 2,015:1',
    value: '2,015 เท่า'
  },
  insight_4: {
    title: 'สภาพคล่องทางการเงิน',
    description: 'เทศบาลมีเงินสะสม 2,500 ล้านบาท ซึ่งเพียงพอสำหรับประมาณ 1.5 ปีของการบริหารงาน แต่เลือกที่จะเก็บมูลค่าดังกล่าวไว้',
    value: '2,502 ล้านบาท'
  }
};

export const BUDGET_SUMMARY_TEXT = `
เทศบาลนครนครราชสีมา มีฐานะทางการเงินที่แข็งแกร่ง:
- เงินสะสม: 2,500 ล้านบาท (เงินคงคลังระยะยาว)
- งบประมาณประจำปี 2569: 1,645.78 ล้านบาท
- สัดส่วนเงินเดือน + บำนาญ: 60% ของงบประมาณ
- งบสำหรับผู้บริหารเมืองและสวัสดิการพื้นฐาน: เพียง 3-4% ของงบประมาณ
`;
