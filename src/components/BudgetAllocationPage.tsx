'use client';

import React, { FC, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, TrendingUp, PieChart } from 'lucide-react';
import {
  MUNICIPALITY_FINANCIAL_SUMMARY,
  BUDGET_ALLOCATION,
  BUDGET_INSIGHTS,
} from '@/data/budget-allocation';

const formatBaht = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(n);

const BudgetAllocationPage: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full bg-white text-gray-900 px-3 sm:px-6 md:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-2 bg-blue-500 rounded-lg">
            <PieChart size={20} className="text-white" />
          </div>
          <span className="text-blue-600 text-xs tracking-widest uppercase font-black">
            โครงสร้างงบประมาณ
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 break-words">
          สัดส่วนการใช้จ่ายงบประมาณ
        </h1>
        <p className="text-gray-500 text-xs mt-2 tracking-wider font-semibold">
          ปีงบประมาณ 2569 เทศบาลนครนครราชสีมา
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-green-300 rounded-2xl p-6">
          <p className="text-green-700 text-xs uppercase tracking-wider font-bold mb-2">
            เงินสะสมของเทศบาล
          </p>
          <p className="text-2xl sm:text-3xl font-black text-green-700 mb-1">
            {formatBaht(MUNICIPALITY_FINANCIAL_SUMMARY.accumulatedFunds)}
          </p>
          <p className="text-xs text-green-600">สามารถบริหารได้ ~1.5 ปี</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-2xl p-6">
          <p className="text-blue-700 text-xs uppercase tracking-wider font-bold mb-2">
            งบประมาณประจำปี 2569
          </p>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mb-1">
            {formatBaht(MUNICIPALITY_FINANCIAL_SUMMARY.annualBudget)}
          </p>
          <p className="text-xs text-blue-600">งบฝากธนาคาร: {formatBaht(MUNICIPALITY_FINANCIAL_SUMMARY.bankDeposits)}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 border border-orange-300 rounded-2xl p-6">
          <p className="text-orange-700 text-xs uppercase tracking-wider font-bold mb-2">
            ทรัพยากรสินเชื่อทั้งหมด
          </p>
          <p className="text-2xl sm:text-3xl font-black text-orange-700 mb-1">
            {formatBaht(MUNICIPALITY_FINANCIAL_SUMMARY.totalReserves)}
          </p>
          <p className="text-xs text-orange-600">นโยบายการออม</p>
        </div>
      </div>

      {/* Budget Insights */}
      <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
          <h2 className="text-xl font-black text-red-900">ประเด็นสำคัญจากการวิเคราะห์</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.values(BUDGET_INSIGHTS).map((insight, idx: number) => {
            if (typeof insight !== 'object' || !('title' in insight)) return null;
            return (
              <div
                key={idx}
                className="bg-white border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <p className="text-red-600 font-black text-sm mb-2">{insight.title}</p>
                <p className="text-gray-700 text-xs leading-relaxed mb-3">{insight.description}</p>
                <p className="text-red-700 font-black text-lg">{insight.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Allocation Breakdown */}
      <h2 className="text-2xl font-black text-gray-900 mb-4">รายละเอียดสัดส่วนงบประมาณ</h2>
      <div className="space-y-4 mb-8">
        {BUDGET_ALLOCATION.map((budget) => {
          const isExpanded = expandedId === budget.id;
          return (
            <div
              key={budget.id}
              className="border-l-4 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              style={{ borderLeftColor: budget.color }}
            >
              {/* Header */}
              <button
                onClick={() => toggleExpand(budget.id)}
                className="w-full bg-white hover:bg-gray-50 transition-colors p-5 sm:p-6 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0 text-left">
                  <div className="text-4xl flex-shrink-0">{budget.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg text-gray-900">{budget.thai_name}</p>
                    <p className="text-sm text-gray-600">{budget.category}</p>
                  </div>
                  <div className="flex items-baseline gap-2 flex-shrink-0 ml-4">
                    <p className="font-black text-gray-900">
                      {formatBaht(budget.amount)}
                    </p>
                    <p
                      className="font-black text-lg"
                      style={{ color: budget.color }}
                    >
                      {budget.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-200 p-5 sm:p-6 space-y-4">
                  {/* Description */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
                      คำอธิบาย
                    </p>
                    <p className="text-gray-800 font-semibold">{budget.description}</p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
                      สัดส่วนของงบทั้งหมด
                    </p>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${budget.percentage}%`,
                          backgroundColor: budget.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Usage Items */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
                      ใช้จ่ายสำหรับ
                    </p>
                    <ul className="space-y-2">
                      {budget.usage.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <span className="text-lg flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Funding Source */}
                  {budget.funding_source && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">
                        แหล่งเงิน
                      </p>
                      <p className="text-sm font-semibold text-gray-900">{budget.funding_source}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-black text-blue-900 mb-4">สรุปโครงสร้างการใช้จ่ายงบประมาณ</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#f97316' }} />
            <span className="font-semibold text-gray-900">บุคลากร 32.3%</span>
            <span className="text-gray-600 ml-auto">530.8 ล้านบาท</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
            <span className="font-semibold text-gray-900">งบกลาง 27.7%</span>
            <span className="text-gray-600 ml-auto">455.5 ล้านบาท</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
            <span className="font-semibold text-gray-900">ดำเนินงาน 24.5%</span>
            <span className="text-gray-600 ml-auto">402.9 ล้านบาท</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <span className="font-semibold text-gray-900">ลงทุน 12.0%</span>
            <span className="text-gray-600 ml-auto">197.0 ล้านบาท</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#ec4899' }} />
            <span className="font-semibold text-gray-900">อุดหนุน 3.6%</span>
            <span className="text-gray-600 ml-auto">59.4 ล้านบาท</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#6b7280' }} />
            <span className="font-semibold text-gray-900">อื่นๆ 0.02%</span>
            <span className="text-gray-600 ml-auto">250,000 บาท</span>
          </div>
        </div>
      </div>

      {/* Key Takeaway */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6">
        <h3 className="text-lg font-black text-purple-900 mb-3">💡 ประเด็นเพื่อการอภิปราย (Hackathon)</h3>
        <p className="text-purple-800 leading-relaxed mb-4">
          เทศบาลนครนครราชสีมามีทรัพยากรทางการเงิน (เงินสะสม 2,500 ล้านบาท) ที่เพียงพอสำหรับการบริหารได้ประมาณ 1.5 ปี แต่ 60% ของงบประมาณประจำปี (986 ล้านบาท) จะถูกใช้ไปกับเงินเดือน เบี้ยยังชีพ และการสมทบกองทุนต่างๆ เหลืองบให้ทำงานด้านบริการประชาชนจริงๆ เพียง 40% เท่านั้น
        </p>
        <p className="text-purple-800 leading-relaxed">
          ปัญหาคือการจัดลำดับความสำคัญ: งบปรับปรุงทางเท้า 3 เส้นทาง (40.3 ล้านบาท) กิน 2,015 เท่าของงบดูแลสัตว์จรจัด (20,000 บาท) ซึ่งเป็นปัญหาความปลอดภัยสาธารณะที่เห็นได้ชัดทั่วเมืองนคร
        </p>
      </div>
    </div>
  );
};

export default BudgetAllocationPage;
