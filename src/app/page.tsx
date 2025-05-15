"use client";

import React, { useState } from 'react';

// 角色类型定义
const roles = ["保险代理人", "新媒体运营"] as const;
type Role = typeof roles[number];

// 优化后的ChatInput组件
const ChatInput = ({ role }: { role: Role }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('发送消息:', inputValue, '当前角色:', role);
    setInputValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto flex items-center bg-white dark:bg-slate-700 rounded-full p-2 shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-800 transition-all"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={`向 ${role} AI 发出指令...`}
        className="flex-grow px-4 py-2.5 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base"
      />
      <button
        type="submit"
        aria-label="发送"
        className="ml-2 p-2.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-700 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </form>
  );
};

export default function HomePage() {
  const [role, setRole] = useState<Role>("保险代理人");
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-blue-600 dark:text-blue-400">EvoWork</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          AI驱动未来工作：雇佣AI数字员工，部署智能工作流，全面提升企业效率。
        </p>
        
        {/* 角色切换功能 */}
        <div className="flex justify-center mb-6 space-x-4">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-5 py-2 rounded-full border transition
                ${role === r
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 使用优化后的ChatInput组件 */}
        <ChatInput role={role} />

        {/* 视频播放区域 */}
        <div className="max-w-2xl mx-auto mt-8 rounded-2xl overflow-hidden shadow-lg">
          <div className="relative" style={{paddingTop: '56.25%'}}>
            <iframe
              src="//player.bilibili.com/player.html?isOutside=true&aid=436966391&bvid=BV1cj411K7SZ&cid=1008533430&p=1"
              scrolling="no"
              frameBorder="0"
              allowFullScreen={true}
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold text-center mb-10 text-slate-800 dark:text-slate-200">核心能力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* 能力1 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=AI" alt="能力1" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">智能对话</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">支持多轮对话，理解上下文，智能应答用户问题。</p>
          </div>
          {/* 能力2 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=Work" alt="能力2" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">流程自动化</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">自动执行重复性任务，提升企业运营效率。</p>
          </div>
          {/* 能力3 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=Data" alt="能力3" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">数据分析</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">智能分析业务数据，辅助决策，洞察趋势。</p>
          </div>
          {/* 能力4 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=API" alt="能力4" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">系统集成</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">无缝对接企业现有系统，扩展AI能力。</p>
          </div>
          {/* 能力5 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=Safe" alt="能力5" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">安全合规</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">严格遵循数据安全与合规要求，保障企业信息安全。</p>
          </div>
          {/* 能力6 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=Cloud" alt="能力6" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">多端部署</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">支持云端、本地及混合部署，灵活适配企业需求。</p>
          </div>
          {/* 能力7 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=Custom" alt="能力7" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">个性化定制</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">根据企业场景深度定制AI能力，满足多样化需求。</p>
          </div>
          {/* 能力8 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center">
            <img src="https://via.placeholder.com/80x80?text=Service" alt="能力8" className="mb-4 rounded-lg" />
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">持续服务</h3>
            <p className="text-slate-600 dark:text-slate-400 text-center text-sm">提供7x24小时技术支持与服务保障。</p>
          </div>
        </div>
      </section>

      {/* 私有化部署展示部分 */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12 text-slate-800 dark:text-slate-200">
            企业私有化部署
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">数据安全与合规</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  数据存储在企业内部，完全符合行业监管和数据隐私要求。
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">高度定制化</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  根据企业特定需求定制AI模型和工作流，深度集成现有系统。
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">性能与稳定性</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  独享计算资源，保障服务性能和稳定性，满足高并发需求。
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">自主可控</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  企业对AI系统拥有完全的控制权，方便迭代升级和运维管理。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white text-center mb-3">
            选择适合您需求的套餐
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-10">
            从免费套餐开始，或升级到高级套餐以获得更多使用时长
          </p>

          {/* Cloud/Self-hosted Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-slate-200/70 dark:bg-slate-700 p-1 rounded-lg space-x-1">
              <button className="px-6 py-2 text-sm font-semibold text-blue-600 bg-white dark:bg-slate-800 rounded-md shadow">
                云端
              </button>
              <button className="px-6 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-600/50 rounded-md">
                私有化部署
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="border-2 border-slate-900 dark:border-white rounded-xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">免费版</h3>
                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1 rounded-full">当前</span>
              </div>
              <p className="text-5xl font-bold text-slate-900 dark:text-white mb-1">$0</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">入门版包含：</p>
              <span className="text-xs self-start font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full mb-6">60分钟/月</span>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8 flex-grow">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  公开项目
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  基础模型 (功能受限)
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-default">
                当前套餐
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col h-full shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">专业版</h3>
                <span className="text-xs bg-blue-100 dark:bg-blue-500/30 text-blue-600 dark:text-blue-300 font-bold px-3 py-1 rounded-full">热门推荐</span>
              </div>
              <p className="text-5xl font-bold text-slate-900 dark:text-white mb-1">
                $20<span className="text-lg font-normal text-slate-500 dark:text-slate-400"> /月</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">包含免费版所有功能，并额外提供：</p>
              <span className="text-xs self-start font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full mb-6">2小时/月</span>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8 flex-grow">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  2小时用量
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  私有项目
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  访问智能模型 (完整版 Suna)
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                升级套餐
              </button>
            </div>

            {/* Custom Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col h-full shadow-lg ring-1 ring-slate-900/5 dark:ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">定制版</h3>
              </div>
              <p className="text-5xl font-bold text-slate-900 dark:text-white mb-1">
                $50<span className="text-lg font-normal text-slate-500 dark:text-slate-400"> /月</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">包含专业版所有功能，并额外提供：</p>
              <div className="mb-2">
                <label htmlFor="custom-plan-hours" className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  自定义您的月度用量
                </label>
                <select
                  id="custom-plan-hours"
                  className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                >
                  <option value="6h_50">6小时 - $50</option>
                  <option value="10h_80">10小时 - $80</option>
                  <option value="20h_150">20小时 - $150</option>
                </select>
              </div>
              <span className="text-xs self-start font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full mb-6">6小时/月</span> {/* This should probably be dynamic based on select */}
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8 flex-grow">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  按需定制
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                升级套餐
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-inner">
        <h2 className="text-3xl font-semibold mb-4 text-slate-800 dark:text-slate-200">准备好迎接工作方式的变革了吗？</h2>
        <p className="text-lg mb-6 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">了解EvoWork如何帮助您的企业在AI时代保持领先。</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          立即咨询
        </button>
      </section>
    </div>
  );
}
