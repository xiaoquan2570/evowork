"use client";
import React from 'react';
import Link from 'next/link';
import {
  DocumentTextIcon,
  PresentationChartLineIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  MegaphoneIcon,
  UserGroupIcon
} from './AgentUseCaseIcons'; // Corrected import path

interface UseCase {
  slug: string;
  icon: React.ElementType;
  title: string;
  description: string;
  image: string;
  link: string;
}

const useCasesData: UseCase[] = [
  {
    slug: 'competitor-analysis',
    icon: DocumentTextIcon,
    title: '市场竞争分析',
    description: '分析特定行业的市场情况，识别竞争对手、市场份额、趋势和机遇。',
    image: 'https://via.placeholder.com/400x250/E0E7FF/4338CA?text=市场分析',
    link: '/use-cases/competitor-analysis',
  },
  {
    slug: 'vc-list',
    icon: PresentationChartLineIcon,
    title: '风险投资机构列表',
    description: '根据特定标准（如资产管理规模），生成目标区域的风险投资基金列表。',
    image: 'https://via.placeholder.com/400x250/D1FAE5/047857?text=VC列表',
    link: '/use-cases/vc-list',
  },
  {
    slug: 'talent-search',
    icon: MagnifyingGlassIcon,
    title: '人才搜寻',
    description: '在专业社交平台（如领英）上，根据职位要求筛选并发现合适的候选人。',
    image: 'https://via.placeholder.com/400x250/FEF3C7/92400E?text=人才搜寻',
    link: '/use-cases/talent-search',
  },
  {
    slug: 'company-trip-planning',
    icon: CalendarDaysIcon,
    title: '公司团建策划',
    description: '根据团队规模、预算和目的地偏好，策划并生成详细的公司团建方案。',
    image: 'https://via.placeholder.com/400x250/FEE2E2/B91C1C?text=团建策划',
    link: '/use-cases/company-trip-planning',
  },
  {
    slug: 'excel-data-processing',
    icon: TableCellsIcon,
    title: 'Excel数据处理',
    description: '自动化处理和分析Excel表格中的数据，生成报告或进行数据清洗。',
    image: 'https://via.placeholder.com/400x250/F3E8FF/6B21A8?text=Excel处理',
    link: '/use-cases/excel-data-processing',
  },
  {
    slug: 'event-speaker-invitations',
    icon: MegaphoneIcon,
    title: '活动嘉宾邀请',
    description: '根据活动主题和要求，在特定领域内寻找并筛选合适的演讲嘉宾。',
    image: 'https://via.placeholder.com/400x250/E0F2FE/0891B2?text=嘉宾邀请',
    link: '/use-cases/event-speaker-invitations',
  },
  {
    slug: 'research-paper-summary',
    icon: DocumentTextIcon, 
    title: '文献研究与总结',
    description: '针对特定主题，搜索、筛选并总结相关的学术论文或研究报告。',
    image: 'https://via.placeholder.com/400x250/D4D4D8/3F3F46?text=文献总结',
    link: '/use-cases/research-paper-summary',
  },
  {
    slug: 'b2b-customer-research',
    icon: UserGroupIcon,
    title: 'B2B客户调研',
    description: '在目标行业中研究潜在的B2B客户，收集关键信息并识别初步接触点。',
    image: 'https://via.placeholder.com/400x250/E5E7EB/4B5563?text=客户调研',
    link: '/use-cases/b2b-customer-research',
  },
];

const UseCaseCard = ({ useCase }: { useCase: UseCase }) => {
  const IconComponent = useCase.icon;
  return (
    <Link href={useCase.link} className="block group bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
      <div className="p-5">
        <div className="flex items-start mb-3">
          <span className="flex-shrink-0 mr-4 mt-1 p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 rounded-lg">
            <IconComponent className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {useCase.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-3 h-[3.75rem]">
              {useCase.description}
            </p>
          </div>
        </div>
      </div>
      <div className="h-48 bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <img 
          src={useCase.image} 
          alt={useCase.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          loading="lazy"
        />
      </div>
    </Link>
  );
};

export const UseCasesSection = () => (
  <section id="use-cases-section" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-850">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white text-center mb-4">
        智能体实际应用案例
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-12 md:mb-16 max-w-2xl mx-auto">
        探索 EvoWork AI 智能体如何在不同场景下提高效率、自动化任务并提供深度洞察。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {useCasesData.map((useCase) => (
          <UseCaseCard key={useCase.slug} useCase={useCase} />
        ))}
      </div>
    </div>
  </section>
);

export default UseCasesSection; 