'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PawPrint,
  Users,
  Building2,
  FileText,
  BarChart2,
  BookOpen,
  Lightbulb,
  Target,
  Calculator,
  Code2,
  MapPin,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Layers,
  Activity,
} from 'lucide-react';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_API = {
  city: 'Nakhon Ratchasima',
  fiscal_year: 2026,
  key_findings: [
    { target: 'Stray Dog Welfare', budget: 20000, ref_page: '696' },
    { target: 'Staff Allowance', budget: 2820000, ref_page: 'Health Dept Section' },
    { target: 'Sidewalk Reno (3 Roads)', budget: 40304000, ref_page: 'Engineer Dept Section' },
  ],
  emergency_fund_available: 15000000,
};

const STATISTICS = {
  population: 111783,
  area_km2: 37.5,
  stray_dog_est: 5000,
};

// ─── Table: Budget Hidden Truths (ความจริงที่ซ่อนอยู่) ────────────────────────

const BUDGET_INSIGHTS = [
  {
    topic: 'ค่าตอบแทนเสี่ยงภัยโรคสัตว์',
    page: 370,
    budget: 100000,
    truth: 'ให้เงินคนทำงานเสี่ยง แต่ไม่ให้เงินจัดการต้นเหตุ (สัตว์)',
    insight: 'ใจเห็นอาการหลังจากพบ ไม่พยายามป้องกันด้านหน้า',
  },
  {
    topic: 'ค่าอาหารและเวชกรรมกักสัตว์',
    page: 544,
    budget: 20000,
    truth: 'ใช้ดูแลสัตว์ในศูนย์พักพิงชั่วคราว (เฉลี่ยวันละ 54 บาท)',
    insight: 'งบจำกัด บังคับเลือก: อาหารน้อย = สุนัขอ่อน/หิว → ค่ารักษา ↑',
  },
  {
    topic: 'เงินสำรองจ่าย (งบกลาง)',
    page: 15,
    budget: 15000000,
    truth: 'มีเงินพอทำศูนย์พักพิงมาตรฐาน แต่ไม่จัดสรรมา',
    insight: 'ศูนย์พักพิง 1 แห่ง ต้องใช้ 2–3% เท่านั้น = 300k–450k บาท',
  },
];

// ─── Table: Historical Budget Comparison (ปี 2566–2569) ─────────────────────

const YEARLY_HISTORY = [
  {
    category: 'งบบุคลากร (สธ.)',
    y2566: 52.1,
    y2567: 56.6,
    y2568: 59.1,
    y2569: 42.5,
    unit: 'ล้าน',
    note: '(จ่ายจริง) → (ประมาณการ) → (ตั้งงบ)',
  },
  {
    category: 'งบสวัสดิภาพสัตว์',
    y2566: null,
    y2567: null,
    y2568: 0.020,
    y2569: 0.020,
    unit: 'ล้าน',
    note: 'ค่าเดียวกัน 3 ปี',
  },
  {
    category: 'ค่าตอบแทนเสี่ยงภัย',
    y2566: null,
    y2567: null,
    y2568: 0.100,
    y2569: 0.100,
    unit: 'ล้าน',
    note: 'ค่าเดียวกัน 2 ปี',
  },
  {
    category: 'เบี้ยเลี้ยงเหมาจ่าย',
    y2566: null,
    y2567: null,
    y2568: 2.82,
    y2569: 2.82,
    unit: 'ล้าน',
    note: 'ค่าเดียวกัน 2 ปี',
  },
];

const BUDGET_ITEMS = [
  {
    id: 1,
    category: 'สวัสดิภาพสัตว์จรจัด',
    name: 'โครงการจัดสวัสดิภาพสุนัขจรจัด',
    amount: 20000,
    department: 'สำนักสาธารณสุขและสิ่งแวดล้อม',
    ref: 'หน้า 696',
    detail: 'ค่าอาหารสัตว์, เวชกรรม, และตรวจวินิจฉัยโรค',
    color: 'emerald',
  },
  {
    id: 2,
    category: 'บุคลากร',
    name: 'ค่าเบี้ยเลี้ยงเหมาจ่ายเจ้าหน้าที่',
    amount: 2820000,
    department: 'สำนักสาธารณสุขและสิ่งแวดล้อม',
    ref: 'Health Dept Section',
    detail: 'เบี้ยเลี้ยงเหมาจ่ายสำหรับเจ้าหน้าที่ลงพื้นที่',
    color: 'amber',
  },
  {
    id: 3,
    category: 'บุคลากร',
    name: 'ค่าตอบแทนผู้ปฏิบัติงานเสี่ยงภัยโรคสัตว์',
    amount: 100000,
    department: 'สำนักสาธารณสุขและสิ่งแวดล้อม',
    ref: 'Health Dept Section',
    detail: 'ค่าตอบแทนพิเศษสำหรับการปฏิบัติงานเสี่ยงภัย',
    color: 'amber',
  },
  {
    id: 4,
    category: 'บุคลากร',
    name: 'งบพนักงานจ้าง (23 อัตรา)',
    amount: 2882200,
    department: 'สำนักสาธารณสุขและสิ่งแวดล้อม',
    ref: 'Health Dept Section',
    detail: 'เงินเดือนพนักงานจ้าง 23 อัตรา',
    color: 'amber',
  },
  {
    id: 5,
    category: 'บุคลากร',
    name: 'เงินประจำตำแหน่งพนักงาน',
    amount: 1515600,
    department: 'สำนักสาธารณสุขและสิ่งแวดล้อม',
    ref: 'Health Dept Section',
    detail: 'เงินประจำตำแหน่งสำหรับพนักงานสาธารณสุข',
    color: 'amber',
  },
  {
    id: 6,
    category: 'โครงสร้างพื้นฐาน',
    name: 'ปรับปรุงทางเท้า 3 เส้นทางหลัก',
    amount: 40304000,
    department: 'สำนักการช่าง',
    ref: 'Engineer Dept Section',
    detail: 'ปรับปรุงทางเท้าเส้นทางหลัก 3 เส้นทาง',
    color: 'blue',
  },
  {
    id: 7,
    category: 'งบกลาง',
    name: 'งบกลาง (เงินสำรองจ่าย)',
    amount: 15000000,
    department: 'กองคลัง',
    ref: 'Finance Section',
    detail: 'เงินสำรองจ่ายสำหรับรายการที่จำเป็นเร่งด่วน',
    color: 'purple',
  },
];

// ─── Computed Insights ───────────────────────────────────────────────────────

const strayWelfareBudget = BUDGET_ITEMS[0].amount; // 20,000
const staffAllowance = BUDGET_ITEMS[1].amount;     // 2,820,000
const totalPersonnel =
  BUDGET_ITEMS[1].amount +
  BUDGET_ITEMS[2].amount +
  BUDGET_ITEMS[3].amount +
  BUDGET_ITEMS[4].amount; // 7,317,800
const infraBudget = BUDGET_ITEMS[5].amount;        // 40,304,000
const emergencyFund = BUDGET_ITEMS[6].amount;      // 15,000,000

const budgetPerDogPerYear = strayWelfareBudget / STATISTICS.stray_dog_est; // 4
const personnelToWelfareRatio = Math.round(staffAllowance / strayWelfareBudget); // 141
const infraToWelfareRatio = Math.round(infraBudget / strayWelfareBudget); // 2,015

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBaht(n: number) {
  return n.toLocaleString('th-TH') + ' บาท';
}

function colorClass(color: string, variant: 'bg' | 'text' | 'border' | 'badge') {
  const map: Record<string, Record<string, string>> = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-300',
      badge: 'bg-amber-100 text-amber-800',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
      badge: 'bg-blue-100 text-blue-800',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-300',
      badge: 'bg-purple-100 text-purple-800',
    },
  };
  return map[color]?.[variant] ?? '';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HackathonPage() {
  const [showJson, setShowJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'budget' | 'insight' | 'stats' | 'breakdown'>('budget');
  const [strayAnimalBudget, setStrayAnimalBudget] = useState<{
    total_budget: number;
    currency: string;
    fiscal_year: number;
    subcategories: Array<{
      id: string;
      fiscal_year: number;
      category: string;
      amount: string;
      percentage: number;
      description: string;
      frequency: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch stray animal budget breakdown
  useEffect(() => {
    const fetchStrayAnimalBudget = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy?type=stray-animal-budget');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStrayAnimalBudget(data);
      } catch (error) {
        console.error('Error fetching stray animal budget:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStrayAnimalBudget();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <div className="w-full flex-1 flex flex-col">
      <div className="bg-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="text-white hover:text-orange-100 text-sm transition-colors font-medium">
              ← กลับหน้าหลัก
            </Link>
          </div>
          <div className="flex items-start gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white opacity-90 mb-1">
                Hackathon · ข้อมูลเปิด
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
                ฐานข้อมูลงบประมาณสุนัขจรจัด
              </h1>
              <p className="text-white opacity-90 mt-1 text-xs sm:text-sm md:text-base font-medium">
                เทศบาลนครนครราชสีมา — ปีงบประมาณ 2569 (2026)
              </p>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'งบดูแลสัตว์จรจัด', value: '20,000 ฿', sub: 'ต่อปี' },
              { label: 'งบต่อตัวต่อปี', value: `${budgetPerDogPerYear} ฿`, sub: `จาก ~${STATISTICS.stray_dog_est.toLocaleString()} ตัว` },
              { label: 'สัดส่วนบุคลากร/สัตว์', value: `${personnelToWelfareRatio}×`, sub: 'เบี้ยเลี้ยง vs งบดูแล' },
              { label: 'สัดส่วนโครงสร้าง/สัตว์', value: `${infraToWelfareRatio.toLocaleString()}×`, sub: 'ทางเท้า vs งบดูแล' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white text-gray-900 rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="text-lg sm:text-xl font-bold text-orange-600">{kpi.value}</div>
                <div className="text-xs sm:text-sm text-gray-700 font-semibold mt-1">{kpi.label}</div>
                <div className="text-xs text-gray-600 mt-1">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 m-2 sm:m-4 md:m-6 rounded-xl sm:rounded-2xl overflow-y-auto bg-white shadow-lg p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
      {/* ── Tabs ── */}
      <div className="w-full">
        <div className="flex gap-1 border-b-2 border-gray-300 mt-0 overflow-x-auto pb-1">
          {([
            { key: 'budget', label: 'งบประมาณรายจ่าย' },
            { key: 'breakdown', label: 'แยกรายการดูแลสัตว์' },
            { key: 'insight', label: 'Hackathon Insight' },
            { key: 'stats', label: 'สถิติพื้นฐาน' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-orange-50 border-b-2 border-orange-500 text-orange-700'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-4 sm:py-6">
          {/* ── Tab: Budget ── */}
          {activeTab === 'budget' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-500">
                รายการงบประมาณรายจ่ายที่เกี่ยวข้องกับสัตว์จรจัดและหน่วยงานที่ดูแล
                เทศบาลนครนครราชสีมา ปี 2569
              </p>

              {/* Category groups */}
              {(['สวัสดิภาพสัตว์จรจัด', 'บุคลากร', 'โครงสร้างพื้นฐาน', 'งบกลาง'] as const).map(
                (cat) => {
                  const items = BUDGET_ITEMS.filter((b) => b.category === cat);
                  const total = items.reduce((s, i) => s + i.amount, 0);
                  return (
                    <div key={cat}>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {cat} — รวม {formatBaht(total)}
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`rounded-xl border ${colorClass(item.color, 'border')} ${colorClass(item.color, 'bg')} p-4 flex flex-col md:flex-row md:items-center gap-3`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass(item.color, 'badge')}`}
                                >
                                  #{item.id}
                                </span>
                                <span className="font-semibold text-gray-800 text-sm">
                                  {item.name}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.department} &nbsp;·&nbsp; {item.ref}
                              </div>
                              <div className="text-xs text-gray-600 mt-1 italic">
                                {item.detail}
                              </div>
                            </div>
                            <div className={`text-lg font-bold ${colorClass(item.color, 'text')} whitespace-nowrap`}>
                              {formatBaht(item.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* ── Tab: Insight ── */}
          {activeTab === 'insight' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                บทวิเคราะห์เพื่อใช้เป็น argument สำหรับฝ่ายค้านในเวที Hackathon เชิงนโยบาย
              </p>

              {/* Ratio Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'งบต่อสุนัขจรจัด 1 ตัว',
                    value: `${budgetPerDogPerYear} ฿/ตัว/ปี`,
                    detail: `งบ 20,000 ÷ ${STATISTICS.stray_dog_est.toLocaleString()} ตัว`,
                    icon: '🐶',
                    insight: 'น้อยกว่าค่าอาหารสุนัขครัวเรือน 1 วัน',
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  },
                  {
                    title: 'สัดส่วนบุคลากร vs งบดูแลสัตว์',
                    value: `${personnelToWelfareRatio}× มากกว่า`,
                    detail: `เบี้ยเลี้ยง 2.82M ÷ งบดูแล 20k`,
                    insight:
                      'ลงพื้นที่ 141 คน-เดือน เพื่อดูแลสัตว์ด้วยงบ 20,000 บาท',
                    color: 'text-amber-700 bg-amber-50 border-amber-200',
                  },
                  {
                    title: 'สัดส่วนทางเท้า vs งบดูแลสัตว์',
                    value: `${infraToWelfareRatio.toLocaleString()}× มากกว่า`,
                    detail: `ทางเท้า 40.3M ÷ งบดูแล 20k`,
                    insight: 'ทางเท้า 1 เมตร มีมูลค่าเทียบเท่างบดูแลสัตว์ทั้งปี',
                    color: 'text-blue-700 bg-blue-50 border-blue-200',
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-xl border p-5 ${card.color}`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
                      {card.title}
                    </div>
                    <div className="text-2xl font-bold mb-1">{card.value}</div>
                    <div className="text-xs opacity-70 mb-3">{card.detail}</div>
                    <div className="text-xs font-medium bg-white/50 rounded-lg p-2">
                      {card.insight}
                    </div>
                  </div>
                ))}
              </div>

              {/* Opportunity */}
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                  <div>
                    <div className="font-bold text-purple-800 mb-1 text-sm sm:text-base">
                      Opportunity — ข้อเสนอนโยบาย
                    </div>
                    <p className="text-xs sm:text-sm text-purple-700 mb-2 sm:mb-3">
                      ใช้งบกลาง (เงินสำรองจ่าย) <strong>15,000,000 บาท</strong> จัดสรรเพียง{' '}
                      <strong>1–2%</strong> ({formatBaht(150000)}–{formatBaht(300000)}) เพื่อสร้าง
                      ศูนย์พักพิงหรืออาสาสมัครชุมชน (Foster Home) ในเขต ต.ในเมือง
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
                      {[
                        { label: 'งบกลางที่มีอยู่', value: '15,000,000 ฿' },
                        { label: '1% งบกลาง', value: '150,000 ฿' },
                        { label: 'ผลลัพธ์จาก 1%', value: '7.5× งบเดิม' },
                        { label: 'Dog/฿ ที่ปรับปรุงได้', value: '30 ฿/ตัว/ปี' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="bg-white rounded-lg p-2 text-center"
                        >
                          <div className="text-base font-bold text-purple-700">
                            {stat.value}
                          </div>
                          <div className="text-xs text-purple-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Hidden Truths Table */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={15} className="text-red-500" />
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                    ความจริงที่ซ่อนอยู่ — Budget Contradiction (สัตว์จรจัด)
                  </span>
                </div>
                <div className="space-y-2">
                  {BUDGET_INSIGHTS.map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="flex flex-col md:flex-row md:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-800">{item.topic}</span>
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                              หน้า {item.page}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 mb-2">
                            <strong>การปลอมนโยบาย:</strong> {item.truth}
                          </div>
                          <div className="text-xs text-red-600 bg-white/60 rounded-lg p-2">
                            <strong>ผลกระทบจริง:</strong> {item.insight}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-500 mb-1">งบประมาณ</div>
                          <div className="text-lg font-bold text-red-700">
                            {formatBaht(item.budget)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical Year-over-Year Comparison */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 size={15} className="text-gray-500" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ประวัติการเงิน — ปีการคลัง 2566–2569
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">
                          รายการ
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">
                          ปี 2566
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">
                          ปี 2567
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">
                          ปี 2568
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700">
                          ปี 2569
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {YEARLY_HISTORY.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">
                            {row.category}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">
                            {row.y2566 !== null ? `${row.y2566} ${row.unit}` : '—'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">
                            {row.y2567 !== null ? `${row.y2567} ${row.unit}` : '—'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">
                            {row.y2568 !== null ? `${row.y2568} ${row.unit}` : '—'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">
                            {row.y2569 !== null ? `${row.y2569} ${row.unit}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  หมายเหตุ: ปี 2566–2567 ไม่มีข้อมูลสัตว์จรจัดรายการแยกชัดเจน — เริ่มมีในปี 2568 เป็นต้นไป
                </p>
              </div>

              {/* Calculated Fields */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code2 size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Calculated Fields (Logic สำหรับเขียน Code)
                  </span>
                </div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm font-mono text-emerald-600 space-y-3 overflow-x-auto border border-slate-200">
                  <div>
                    <span className="text-gray-400">{'// budget per dog per year'}</span>
                    <br />
                    <span className="text-blue-700">budget_per_dog_per_year</span>
                    {' = '}
                    <span className="text-amber-700">items[1].amount</span>
                    {' / '}
                    <span className="text-amber-700">stray_dog_est</span>
                    <br />
                    {`// = 20000 / 5000 = `}
                    <span className="text-emerald-300">{budgetPerDogPerYear}</span>
                    {' ฿/ตัว/ปี'}
                  </div>
                  <div>
                    <span className="text-gray-400">{'// personnel to welfare ratio'}</span>
                    <br />
                    <span className="text-blue-700">personnel_to_welfare_ratio</span>
                    {' = '}
                    <span className="text-amber-700">items[2].amount</span>
                    {' / '}
                    <span className="text-amber-700">items[1].amount</span>
                    <br />
                    {`// = 2820000 / 20000 = `}
                    <span className="text-emerald-300">{personnelToWelfareRatio}</span>
                    {' เท่า'}
                  </div>
                  <div>
                    <span className="text-gray-400">{'// infra to welfare ratio'}</span>
                    <br />
                    <span className="text-blue-700">infra_to_welfare_ratio</span>
                    {' = '}
                    <span className="text-amber-700">
                      (items[4]+items[5]+items[6]).amount
                    </span>
                    {' / '}
                    <span className="text-amber-700">items[1].amount</span>
                    <br />
                    {`// = 40304000 / 20000 = `}
                    <span className="text-emerald-300">{infraToWelfareRatio.toLocaleString()}</span>
                    {' เท่า'}
                  </div>
                </div>
              </div>

              {/* Mock API JSON */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Mock API JSON
                  </div>
                  <button
                    onClick={() => setShowJson((v) => !v)}
                    className="text-xs px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                  >
                    {showJson ? 'ซ่อน JSON' : 'แสดง JSON'}
                  </button>
                </div>
                {showJson && (
                  <div className="bg-slate-100 rounded-xl p-4 text-xs font-mono text-slate-700 overflow-x-auto border border-slate-200">
                    <pre>{JSON.stringify(MOCK_API, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Stats ── */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                ข้อมูลพื้นฐานของเทศบาลนครนครราชสีมา — อ้างอิงเพื่อใช้ประกอบการคำนวณ
              </p>

              {/* City Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'ประชากร',
                    value: STATISTICS.population.toLocaleString('th-TH'),
                    unit: 'คน',
                    ref: 'หน้า 3',
                  },
                  {
                    label: 'พื้นที่',
                    value: STATISTICS.area_km2.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                    unit: 'ตร.กม.',
                    ref: 'หน้า 3',
                  },
                  {
                    label: 'สุนัขจรจัด (ประมาณการ)',
                    value: STATISTICS.stray_dog_est.toLocaleString('th-TH'),
                    unit: 'ตัว',
                    ref: 'ค่าประมาณการ Hackathon',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-gray-200 bg-white  p-4 sm:p-5 text-center text-xs sm:text-sm hover:shadow-lg hover:border-orange-300 transition-all"
                  >
                    <div className="text-2xl sm:text-3xl font-bold bg-white  bg-clip-text text-transparent mb-2 sm:mb-3">
                      {s.value}{' '}
                      <span className="text-base font-normal text-gray-500">{s.unit}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.ref}</div>
                  </div>
                ))}
              </div>

              {/* Density */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="font-semibold text-gray-700 mb-4">
                  ตัวชี้วัดความหนาแน่น
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {[
                    {
                      label: 'ความหนาแน่นประชากร',
                      value: `${(STATISTICS.population / STATISTICS.area_km2).toFixed(0)} คน/ตร.กม.`,
                    },
                    {
                      label: 'สุนัขจรจัดต่อตร.กม.',
                      value: `${(STATISTICS.stray_dog_est / STATISTICS.area_km2).toFixed(0)} ตัว/ตร.กม.`,
                    },
                    {
                      label: 'สุนัขจรจัดต่อประชากร',
                      value: `1 ตัว ต่อ ${Math.round(STATISTICS.population / STATISTICS.stray_dog_est)} คน`,
                    },
                    {
                      label: 'งบดูแลต่อตร.กม.',
                      value: `${(strayWelfareBudget / STATISTICS.area_km2).toFixed(0)} ฿/ตร.กม.`,
                    },
                    {
                      label: 'งบดูแลต่อประชากร',
                      value: `${(strayWelfareBudget / STATISTICS.population).toFixed(2)} ฿/คน`,
                    },
                    {
                      label: 'งบกลางต่อประชากร',
                      value: `${(emergencyFund / STATISTICS.population).toFixed(0)} ฿/คน`,
                    },
                  ].map((row) => (
                    <div key={row.label} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{row.label}</div>
                      <div className="font-semibold text-gray-800">{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Comparison Bar */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="font-semibold text-gray-700 mb-4">
                  เปรียบเทียบสัดส่วนงบประมาณ (scale log)
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: 'ทางเท้า 3 เส้นทาง',
                      amount: 40304000,
                      color: 'bg-blue-500',
                    },
                    { label: 'งบกลาง', amount: 15000000, color: 'bg-purple-500' },
                    {
                      label: 'งบพนักงานจ้าง (23 อัตรา)',
                      amount: 2882200,
                      color: 'bg-amber-500',
                    },
                    {
                      label: 'เบี้ยเลี้ยงเจ้าหน้าที่',
                      amount: 2820000,
                      color: 'bg-amber-400',
                    },
                    {
                      label: 'เงินประจำตำแหน่ง',
                      amount: 1515600,
                      color: 'bg-amber-300',
                    },
                    {
                      label: 'ค่าตอบแทนเสี่ยงภัย',
                      amount: 100000,
                      color: 'bg-orange-400',
                    },
                    {
                      label: 'งบดูแลสัตว์จรจัด ⭐',
                      amount: 20000,
                      color: 'bg-emerald-500',
                    },
                  ].map((row) => {
                    const pct = Math.max(
                      2,
                      (Math.log10(row.amount) / Math.log10(40304000)) * 100
                    );
                    return (
                      <div key={row.label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{row.label}</span>
                          <span className="font-semibold">{formatBaht(row.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-5">
                          <div
                            className={`${row.color} h-5 rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  * แกนแสดงผลแบบ logarithmic scale เพื่อให้เห็นทุกรายการชัดเจน
                </p>
              </div>
            </div>
          )}

          {/* ── Tab: Breakdown ── */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                งบประมาณดูแลสัตว์จรจัดแยกเป็นหมวดหมู่ย่อย ปีงบประมาณ 2569 รวม 20,000 บาท
              </p>

              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <div>กำลังโหลดข้อมูล...</div>
                </div>
              ) : (strayAnimalBudget?.subcategories?.length ?? 0) > 0 ? (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {strayAnimalBudget!.subcategories!.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all"
                      >
                        <div className="font-bold text-lg text-orange-600">
                          {item.percentage}%
                        </div>
                        <div className="text-xs font-semibold text-gray-700 mt-2">
                          {item.category}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatBaht(parseFloat(item.amount))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Detailed Table */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-orange-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            หมวดหมู่
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                            จำนวนเงิน
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                            สัดส่วน
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                            รายละเอียด
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                            ความถี่
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {strayAnimalBudget!.subcategories!.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-150 hover:bg-orange-50 transition-colors ${
                              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          >
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                              {item.category}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-orange-600">
                              {formatBaht(parseFloat(item.amount))}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-600">
                              {item.percentage}%
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-gray-500">
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                {item.frequency}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary footer */}
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">รวม</div>
                        <div className="text-lg font-bold text-orange-600">
                          {formatBaht(strayAnimalBudget!.total_budget)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">ปีงบประมาณ</div>
                        <div className="text-lg font-bold text-gray-800">
                          {strayAnimalBudget!.fiscal_year}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">สกุลเงิน</div>
                        <div className="text-lg font-bold text-gray-800">
                          {strayAnimalBudget!.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>ไม่มีข้อมูลงบประมาณแยกรายการ</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          <p>
            ข้อมูลจากเอกสารงบประมาณรายจ่ายประจำปี 2569 เทศบาลนครนครราชสีมา
          </p>
          <p className="mt-1">
            สุนัขจรจัดประมาณการ 5,000 ตัว — ใช้เป็นค่าประมาณสำหรับ Hackathon เท่านั้น
          </p>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
