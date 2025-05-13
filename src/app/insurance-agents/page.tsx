// src/app/insurance-agents/page.tsx (或者您期望的实际路径)
import React from 'react';
// 建议使用一个图标库，例如 Heroicons (https://heroicons.com/) 或 Font Awesome
// import { DocumentTextIcon, MapIcon, LightBulbIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'; // 示例

// 定义Agent的数据结构类型
interface InsuranceAgent {
  id: string;
  icon?: React.ElementType; // 用于图标组件，例如 Heroicons
  iconPlaceholder?: string; // 如果不使用图标库，可以用文本占位符
  name: string;
  description: string;
  valueProposition: string;
  tryLink: string;
}

// 示例Agent数据
const insuranceAgentsData: InsuranceAgent[] = [
  {
    id: 'policy-advisor',
    // icon: DocumentTextIcon, // 示例图标
    iconPlaceholder: '📄',
    name: '智能保单顾问',
    description: '解答客户关于保单条款、覆盖范围、费用的疑问，提供清晰易懂的解释。',
    valueProposition: '提升客户理解度，减少误解，提高客户满意度。',
    tryLink: '#', // 替换为实际试用链接
  },
  {
    id: 'claims-navigator',
    // icon: MapIcon, // 示例图标
    iconPlaceholder: '🗺️',
    name: '理赔流程导航员',
    description: '指导客户完成理赔申请，收集必要文件，实时更新理赔进度。',
    valueProposition: '简化理赔流程，加快理赔速度，减轻客户焦虑。',
    tryLink: '#',
  },
  {
    id: 'recommendation-engine',
    // icon: LightBulbIcon, // 示例图标
    iconPlaceholder: '💡',
    name: '个性化推荐引擎',
    description: '根据客户画像和需求，智能推荐最合适的保险产品组合。',
    valueProposition: '提高交叉销售和向上销售机会，提升保单价值。',
    tryLink: '#',
  },
  {
    id: 'renewal-assistant',
    // icon: CalendarDaysIcon, // 示例图标
    iconPlaceholder: '📅',
    name: '续保小助手',
    description: '提前发送续保提醒，协助客户便捷完成续保手续，解答续保疑问。',
    valueProposition: '提高客户留存率，确保保单连续性，减少人工跟进成本。',
    tryLink: '#',
  },
];

export default function InsuranceAgentShowcasePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto space-y-16">
        {/* 上半部分 - 数字人形象和描述 - 更新为左右布局 */}
        <section className="md:flex md:items-center md:space-x-12"> {/* 使用 Flexbox 实现左右布局 */}
          {/* 左侧图片 */}
          <div className="md:w-1/3 lg:w-2/5 mb-10 md:mb-0 flex-shrink-0">
            <img
              src="/images/insurance_agent_professional.png" // 请确保图片路径正确
              alt="专业保险代理人数字员工"
              className="w-full max-w-md mx-auto md:mx-0 rounded-xl shadow-2xl" // 调整图片宽度和居中
            />
          </div>

          {/* 右侧文字说明 */}
          <div className="md:w-2/3 lg:w-3/5 text-center md:text-left"> {/* 文本在大屏幕上左对齐 */}
            <h1 className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6 leading-tight">
              AI赋能保险代理人，<br className="hidden md:block" />重塑服务新体验
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto md:mx-0 mb-8">
              我们的数字人智能体Agent，专为保险行业设计，能够协助保险代理人高效完成日常工作，提升服务质量和客户满意度。
            </p>
            <div className="max-w-xl mx-auto md:mx-0 text-left text-slate-700 dark:text-slate-300 space-y-2">
              <p className="text-md font-semibold mb-3">数字人Agent可以帮助您：</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-sm sm:text-base">
                <li>7x24小时在线，即时响应客户咨询与初步筛选。</li>
                <li>精准解答保单信息，提供专业的条款解释。</li>
                <li>高效指引理赔流程，协助客户准备和提交材料。</li>
                <li>智能发送续保提醒，简化续保办理流程。</li>
                <li>基于客户数据分析，生成个性化保险产品推荐。</li>
                <li>自动化处理重复性任务，让您聚焦核心业务拓展。</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 下半部分 - Agent网格展示 */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-12 text-slate-800 dark:text-slate-200">
            探索保险场景数字人Agent解决方案
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {insuranceAgentsData.map((agent) => (
              <div
                key={agent.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-6 sm:p-8 flex-grow">
                  <div className="flex items-center mb-4">
                    {agent.icon ? (
                      <agent.icon className="h-10 w-10 text-blue-500 dark:text-blue-400 mr-4" />
                    ) : (
                      <span className="text-3xl mr-4">{agent.iconPlaceholder}</span>
                    )}
                    <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                      {agent.name}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-3 text-sm leading-relaxed">
                    {agent.description}
                  </p> {/* <--- 修正这里，补全闭合标签 */}
                  <div className="mt-auto">
                     <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">核心价值:</p>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                       {agent.valueProposition}
                     </p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4">
                   <a
                    href={agent.tryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-300 transform hover:scale-105"
                  >
                    立即试用
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}