// Budget Anomalies and Red Flags from ordinance69-1.pdf
// Data extracted for transparency and public accountability analysis

export interface BudgetAnomaly {
  id: string;
  title: string; // ชื่อความผิดปกติ
  severity: 'critical' | 'high' | 'medium';
  description: string;
  ratio: number; // เท่าตัวความแตกต่าง
  ratioLabel: string; // คำอธิบายอัตราส่วน
  items: {
    name: string;
    amount: number;
    unit: string;
    page: number;
  }[];
  analysis: string; // การวิเคราะห์เชิงลึก
  year: number;
  pdfPages: number[];
  severity_emoji: string;
}

export interface BudgetSummary {
  year: number;
  totalBudget: number;
  totalBudgetLabel: string;
  actualSpending: {
    year: number;
    amount: number;
    label: string;
  };
  description: string;
  pdfPage: number;
}

export const BUDGET_SUMMARY: BudgetSummary = {
  year: 2569,
  totalBudget: 1645781000,
  totalBudgetLabel: 'งบประมาณรายจ่ายประจำปี 2569',
  actualSpending: {
    year: 2567,
    amount: 1135599344.05,
    label: 'รายจ่ายจริงที่ใช้ไปในปี 2567',
  },
  description:
    'ยอดรวมงบประมาณรายจ่ายประจำปี พ.ศ. 2569 ของเทศบาลนครนครราชสีมา',
  pdfPage: 13,
};

export const BUDGET_ANOMALIES: BudgetAnomaly[] = [
  {
    id: 'ANOM-001',
    title: 'การจัดลำดับความสำคัญของงบประมาณ (ทางเท้า vs สัตว์จรจัด)',
    severity: 'critical',
    severity_emoji: '🔴',
    description:
      'งบปรับปรุงทางเท้า 3 เส้นทางหลักสูงกว่างบดูแลสัตว์จรจัดที่เป็นปัญหาความปลอดภัยสาธารณะ',
    ratio: 2015,
    ratioLabel: '40.3 ล้าน : 20,000 บาท',
    items: [
      {
        name: 'งบปรับปรุงถนนจอมสุรางค์ยาตร์',
        amount: 13650000,
        unit: 'บาท',
        page: 108,
      },
      {
        name: 'งบปรับปรุงถนนโพธิ์กลาง',
        amount: 13325000,
        unit: 'บาท',
        page: 108,
      },
      {
        name: 'งบปรับปรุงถนนสุรนารี',
        amount: 13320000,
        unit: 'บาท',
        page: 108,
      },
      {
        name: 'โครงการจัดสวัสดิภาพสุนัขจรจัด',
        amount: 20000,
        unit: 'บาท',
        page: 544,
      },
    ],
    analysis:
      'เทศบาลตั้งงบปรับปรุงโครงสร้างทางขนส่ง (ทางเท้า) รวม 40.3 ล้านบาท แต่จัดสรรเงินเพียง 20,000 บาท สำหรับจัดการปัญหาหมาจรจัดซึ่งเป็นปัญหาความปลอดภัยสาธารณะทั่วเมืองนคร อัตราส่วนความแตกต่างถึง 2,015 เท่า ซึ่งแสดงถึงลำดับความสำคัญที่อาจจะไม่สอดคล้องกับความต้องการของประชาชน',
    year: 2569,
    pdfPages: [108, 544, 696],
  },
  {
    id: 'ANOM-002',
    title: 'งบสวัสดิการเจ้าหน้าที่สูงกว่างบลงมือทำงานจริง',
    severity: 'critical',
    severity_emoji: '🔴',
    description:
      'ค่าเบี้ยเลี้ยงเหมาจ่ายสูงกว่ากลุ่มการงานด้านสาธารณสุขที่เสี่ยงต่อโรคสัตว์และการจัดการปัญหาหมา',
    ratio: 141,
    ratioLabel: '2.82 ล้าน : 20,000 บาท (สัตว์จรจัด)',
    items: [
      {
        name: 'ค่าเบี้ยเลี้ยงเหมาจ่ายเจ้าหน้าที่ (สำนักสาธารณสุข)',
        amount: 2820000,
        unit: 'บาท',
        page: 370,
      },
      {
        name: 'ค่าตอบแทนผู้ปฏิบัติงานเสี่ยงภัยโรคสัตว์',
        amount: 100000,
        unit: 'บาท',
        page: 370,
      },
      {
        name: 'โครงการจัดการความเสี่ยง (หมาจรจัด)',
        amount: 20000,
        unit: 'บาท',
        page: 544,
      },
    ],
    analysis:
      'เทศบาลจ่ายค่าเบี้ยและค่าตอบแทนให้เจ้าหน้าที่รวม 2.82 ล้านบาท แต่จัดสรรเงินเพียง 100,000 บาท สำหรับผู้ปฏิบัติงาน "เสี่ยงภัยโรคสัตว์" และเพียง 20,000 บาท สำหรับ "จัดการความเสี่ยง" ที่เกี่ยวข้องกับหมาจรจัด ปัญหานี้ชี้ให้เห็นการไม่สมดุลในการจัดสรรงบประมาณระหว่างอัตราการเบิกจ่ายสวัสดิการและงบลงมือทำงานจริง',
    year: 2569,
    pdfPages: [370],
  },
  {
    id: 'ANOM-003',
    title: 'การจ้างเหมาบุคคลภายนอก (Outsourcing) ซ้ำซ้อน',
    severity: 'high',
    severity_emoji: '🔴',
    description:
      'จ้างเหมาบริษัทภายนอกเข้ามาประเมินผลงานเทศบาล ในขณะที่มีข้าราชการประจำและบุคลากรจำนวนมาก',
    ratio: 15,
    ratioLabel: '300,000 : 20,000 บาท',
    items: [
      {
        name: 'จ้างเหมาติดตามและประเมินผลแผนพัฒนา',
        amount: 300000,
        unit: 'บาท',
        page: 358,
      },
      {
        name: 'โครงการจัดสวัสดิภาพสุนัขจรจัด',
        amount: 20000,
        unit: 'บาท',
        page: 544,
      },
    ],
    analysis:
      'เทศบาลจ่ายเงินสูงถึง 300,000 บาท เพื่อจ้างบริษัท/บุคคลภายนอกมา "ประเมินผลแผนพัฒนา" ของเทศบาลเอง ค่าใช้จ่ายนี้สูงกว่างบจัดการปัญหาหมาจรจัดถึง 15 เท่า ซึ่งบ่งชี้ถึงจุดอ่อนในการบริหารงบประมาณและการจัดสรรเงินที่อาจไม่มีประสิทธิภาพ',
    year: 2569,
    pdfPages: [358],
  },
];

export const ANOMALY_SUMMARY = {
  totalAnomalies: BUDGET_ANOMALIES.length,
  criticalCount: BUDGET_ANOMALIES.filter(
    (a) => a.severity === 'critical'
  ).length,
  highCount: BUDGET_ANOMALIES.filter((a) => a.severity === 'high').length,
  maxRatio: Math.max(...BUDGET_ANOMALIES.map((a) => a.ratio)),
  totalDifferenceHighlighted: BUDGET_ANOMALIES.reduce(
    (sum, a) => sum + a.ratio,
    0
  ),
};
