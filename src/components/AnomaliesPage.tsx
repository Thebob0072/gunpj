'use client';

import React, { FC } from 'react';
import { AlertCircle, FileText, TrendingUp, CheckCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BUDGET_SUMMARY, BUDGET_ANOMALIES, ANOMALY_SUMMARY } from '@/data/budget-anomalies';

const formatBaht = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(n);

const AnomaliesPage: FC = () => {
  const router = useRouter();

  return (
    <div className="w-full bg-white text-gray-900 px-3 sm:px-6 md:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft size={18} />
        ย้อนกลับ
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-2 bg-red-500 rounded-lg">
            <AlertCircle size={20} className="text-white" />
          </div>
          <span className="text-red-600 text-xs tracking-widest uppercase font-black">
            ความโปร่งใส · การตรวจสอบ
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 break-words">
          จุดผิดปกติในงบประมาณ
        </h1>
        <p className="text-gray-500 text-xs mt-2 tracking-wider font-semibold">
          จากการวิเคราะห์เทศบัญญัติงบประมาณรายจ่ายประจำปี พ.ศ. 2569 ของเทศบาลนครนครราชสีมา
        </p>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText size={20} className="text-white" />
            </div>
            <h3 className="font-black text-lg text-blue-900">งบประมาณตั้งไว้</h3>
          </div>
          <p className="text-3xl font-black text-blue-900">
            {formatBaht(BUDGET_SUMMARY.totalBudget)}
          </p>
          <p className="text-xs text-blue-700 mt-2">
            ปี {BUDGET_SUMMARY.year} (หน้า {BUDGET_SUMMARY.pdfPage})
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle size={20} className="text-white" />
            </div>
            <h3 className="font-black text-lg text-green-900">รายจ่ายจริง</h3>
          </div>
          <p className="text-3xl font-black text-green-900">
            {formatBaht(BUDGET_SUMMARY.actualSpending.amount)}
          </p>
          <p className="text-xs text-green-700 mt-2">
            ปี {BUDGET_SUMMARY.actualSpending.year} (หน้า {BUDGET_SUMMARY.pdfPage})
          </p>
        </div>
      </div>

      {/* Anomaly Summary Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-xs uppercase tracking-wider font-bold mb-2">
            ความผิดปกติทั้งหมด
          </p>
          <p className="text-3xl font-black text-red-600">{ANOMALY_SUMMARY.totalAnomalies}</p>
          <p className="text-xs text-red-500 mt-1">
            {ANOMALY_SUMMARY.criticalCount} วิกฤต · {ANOMALY_SUMMARY.highCount} สูง
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-orange-600 text-xs uppercase tracking-wider font-bold mb-2">
            อัตราส่วนสูงสุด
          </p>
          <p className="text-3xl font-black text-orange-600">
            1 : {ANOMALY_SUMMARY.maxRatio.toLocaleString('th-TH')}
          </p>
          <p className="text-xs text-orange-500 mt-1">เท่าตัวความแตกต่าง</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-purple-600 text-xs uppercase tracking-wider font-bold mb-2">
            หมวดงบที่เกี่ยวข้อง
          </p>
          <p className="text-3xl font-black text-purple-600">
            {new Set(BUDGET_ANOMALIES.flatMap((a) => a.pdfPages)).size}
          </p>
          <p className="text-xs text-purple-500 mt-1">หน้าเอกสาร PDF</p>
        </div>
      </div>

      {/* Detailed Anomalies */}
      <div className="space-y-6">
        {BUDGET_ANOMALIES.map((anomaly, idx) => (
          <div
            key={anomaly.id}
            className={`border-l-8 rounded-lg p-6 ${
              anomaly.severity === 'critical'
                ? 'bg-red-50 border-red-500'
                : 'bg-orange-50 border-orange-500'
            }`}
          >
            {/* Title and Severity */}
            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl flex-shrink-0">{anomaly.severity_emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">
                    {idx + 1}. {anomaly.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full text-white ${
                      anomaly.severity === 'critical'
                        ? 'bg-red-600'
                        : 'bg-orange-600'
                    }`}
                  >
                    {anomaly.severity === 'critical' ? 'วิกฤต' : 'สูง'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{anomaly.description}</p>
              </div>
            </div>

            {/* Ratio Highlight */}
            <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-yellow-500">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
                อัตราส่วนความแตกต่าง
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-2xl font-black text-red-600">
                  1 : {anomaly.ratio.toLocaleString('th-TH')}
                </p>
                <p className="text-sm text-gray-600 font-semibold">{anomaly.ratioLabel}</p>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-600"
                  style={{
                    width: `${Math.min((anomaly.ratio / ANOMALY_SUMMARY.maxRatio) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Budget Items Comparison */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">
                รายละเอียดการเปรียบเทียบ
              </p>
              <div className="space-y-3">
                {anomaly.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-semibold text-gray-900 break-words">
                        {item.name}
                      </p>
                      <a
                        href={`/ordinance69-1.pdf#page=${item.page}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        📄 หน้า {item.page}
                      </a>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-gray-900">{formatBaht(item.amount)}</p>
                      <p className="text-xs text-gray-500">{item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">
                การวิเคราะห์เชิงลึก
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{anomaly.analysis}</p>
            </div>

            {/* PDF References */}
            <div className="mt-4 flex flex-wrap gap-2">
              {anomaly.pdfPages.map((page) => (
                <a
                  key={`page-${page}`}
                  href={`/ordinance69-1.pdf#page=${page}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 hover:text-blue-600"
                >
                  📄 หน้า {page}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-blue-900 leading-relaxed">
          <strong>หมายเหตุ:</strong> ข้อมูลและการวิเคราะห์นี้มาจากเทศบัญญัติงบประมาณรายจ่ายประจำปี
          พ.ศ. 2569 ของเทศบาลนครนครราชสีมา จุดผิดปกติที่พบเหล่านี้สามารถนำไปใช้เป็นประเด็นตรวจสอบ
          และการปรับปรุงการจัดสรรงบประมาณในอนาคต
        </p>
      </div>
    </div>
  );
};

export default AnomaliesPage;
