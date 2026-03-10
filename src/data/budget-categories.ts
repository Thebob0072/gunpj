// Budget data from ordinance69-1.pdf organized by categories

export interface BudgetItem {
  id: string;
  name: string;
  budget: number;
  unit: string;
  reference: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: BudgetItem[];
}

export const BUDGET_DATA = {
  municipalityTotalBudget: 1645781000, // งบประมาณรวมของเทศบาลนครนครราชสีมา ปี 2569
  municipalityYear: 2569,
  categories: [
    {
      id: 'INF',
      name: 'โครงสร้างพื้นฐาน (Infrastructure)',
      icon: '🏗️',
      color: '#f97316',
      items: [
        {
          id: 'INF-01',
          name: 'ปรับปรุงถนนเข้า อ.อมุตยืดยศวัฒน์',
          budget: 13659000,
          unit: 'สำนักการข่าง',
          reference: 'บรรจุลูกจ้างในแตเดิมยืง'
        },
        {
          id: 'INF-02',
          name: 'ปรับปรุงถนนเข้า อ. โพธิ์กลาง',
          budget: 13325000,
          unit: 'สำนักการข่าง',
          reference: 'บรรจุลูกจ้างในแตเดิมยืง'
        },
        {
          id: 'INF-03',
          name: 'ปรับปรุงถนนเข้า อ.สุสumann',
          budget: 13320000,
          unit: 'สำนักการข่าง',
          reference: 'บรรจุลูก 3 เต่เรวมศึกษ 40.3 สำนาท'
        }
      ]
    },
    {
      id: 'PER',
      name: 'บุคลากร (Personnel)',
      icon: '👥',
      color: '#f59e0b',
      items: [
        {
          id: 'PER-01',
          name: 'เบี้ยเลี้ยงข้าราชการข้าท่ำนำที่',
          budget: 2820000,
          unit: 'สำนักสารเหลุสบ',
          reference: 'สูครำ่างจดสำการศึกษ 141 บำ'
        },
        {
          id: 'PER-02',
          name: 'เบี้ยประโยชนอนตแนนชี้เบิกสรส (เบิม/รวจวีำ)',
          budget: 1000000,
          unit: 'กลองการเดำหำนำที่',
          reference: 'ตำเบิ้งในงบวิศสศต่อนำที่'
        },
        {
          id: 'PER-03',
          name: 'คำใช้เงินในการเล้นควำโปรการ (วนตำนชันสันข)',
          budget: 132400,
          unit: 'หลวงส่นำ',
          reference: 'ตระงดชูตมชำมว่ง นอสรวมศสนสนาร'
        },
        {
          id: 'PER-04',
          name: 'คำชุงเนเบิมในการศึกเลวนอม',
          budget: 250000,
          unit: 'สำนักเสารการของเรต',
          reference: 'ไป็สตเด्จำ์บเขื่องบิ่งชำมสิน'
        },
        {
          id: 'PER-05',
          name: 'คำความแนนอ่งปิจศิงสิ่งสิภี็วชวสศ',
          budget: 100000,
          unit: 'สำนักสารเหลุสบ',
          reference: 'สำศสนเบิง้สิง สูกจำ่งจดสำการศึดแหเจวค'
        }
      ]
    },
    {
      id: 'EQ',
      name: 'อุปกรณ์ (Equipment)',
      icon: '🖥️',
      color: '#3b82f6',
      items: [
        {
          id: 'EQ-01',
          name: 'จอ Video wall',
          budget: 470000,
          unit: 'สนส่งทาง/บัญการ',
          reference: 'ราศศูจการ จำเบิ้งสารการโปรศัสสปรสงณปรธตม?'
        },
        {
          id: 'EQ-02',
          name: 'จอทิ Touch Screen',
          budget: 370000,
          unit: 'สนส่งทาง/บัญการ',
          reference: 'ราศศูจการ เบิ่งวำบแท EQ-01 เบิงการศี่องออยเสญ 1 สำนาท'
        },
        {
          id: 'EQ-03',
          name: 'จออื่อสีระแบบโศกที่เศน',
          budget: 150000,
          unit: 'สนส่งทาง/บัญการ',
          reference: 'ไปใดจี่องการศี่องปื่งศตษบปรสงณปรธต'
        },
        {
          id: 'EQ-04',
          name: 'เครื่องอื่สิปี่งปิเรเยแหอเอศ ระดับ XGA',
          budget: 75100,
          unit: 'สนส่งทาง/บัญการ',
          reference: 'ราศศูจการไปเรเยแหอเอศทำในโปซ้องศตษบ'
        }
      ]
    },
    {
      id: 'EV',
      name: 'งานกิจกรรม (Events)',
      icon: '🎉',
      color: '#8b5cf6',
      items: [
        {
          id: 'EV-01',
          name: 'โครงการแนนเที่ยมพรราษ',
          budget: 5000000,
          unit: 'สำนักการศึกษา',
          reference: 'ใช้สูลจการ (5 สำนาท) สำกันิสนการศตษบ'
        },
        {
          id: 'EV-02',
          name: 'โครงการศสศศตภาษูบบวิวง',
          budget: 20000,
          unit: 'สำนักสารเหลุสบ',
          reference: 'สนยั้งชิบศบกบ ไมสศตศี่องเสิบบิยเยนศศต้เจษต'
        },
        {
          id: 'EV-03',
          name: 'ศศตราง (อาการวัง อาสน แสศชำบ)',
          budget: 100000,
          unit: 'สำนักเสาร',
          reference: 'สนยั้งชิบรองศสูจการ สูกจำ่งบจสำจการชวศตำลระชียคำต 5 แห'
        }
      ]
    }
  ]
};

// Summary by category
export const CATEGORY_TOTALS = {
  'INF': 40304000,      // โครงสร้างพื้นฐาน
  'PER': 2882200,       // บุคลากร + สวัสดิการ
  'EQ': 1065100,        // อุปกรณ์
  'EV': 5120000,        // งานกิจกรรม
  'TOTAL': 49371300
};
