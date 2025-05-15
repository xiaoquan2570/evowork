"use client";
// Remove existing import Image from "next/image"; if it's the default one and not used below.
// Or keep it if you plan to use Next/Image component.

import React, { useState } from 'react'; // 确保导入 React 和 useState

// 新增：聊天输入组件
const ChatInput = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 在这里处理消息发送逻辑，例如调用 API
    console.log('发送消息:', inputValue);
    setInputValue(''); // 清空输入框
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 max-w-xl mx-auto flex items-center bg-white dark:bg-slate-700 rounded-full p-1.5 sm:p-2 shadow-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-800 transition-all"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="向 EvoWork AI 发出指令..."
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
  const [role, setRole] = useState("保险代理人");
  const roles = ["保险代理人", "新媒体运营"];

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
        <form
          className="max-w-2xl mx-auto flex items-center bg-white rounded-full shadow-lg px-6 py-4"
          onSubmit={e => { e.preventDefault(); }}
        >
          <input
            type="text"
            placeholder="Ask Suna to..."
            className="flex-grow bg-transparent outline-none text-gray-700 placeholder-gray-400 text-lg"
          />
          <button
            type="submit"
            className="ml-2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
            aria-label="发送"
          >
            <svg width="24" height="24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M5 12h14M13 18l6-6-6-6"/>
            </svg>
          </button>
        </form>
        {/* 新增：视频播放区域 */}
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
