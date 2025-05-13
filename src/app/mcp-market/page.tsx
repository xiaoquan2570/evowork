// src/app/mcp-market/page.tsx
import React from 'react';

// 定义服务分类的数据结构
interface McpCategory {
  id: string;
  name: string;
  count: number;
}

// 定义MCP服务的数据结构
interface McpService {
  id: string;
  name: string;
  author: string;
  description: string;
  type: "Hosted" | "Local";
  iconUrl?: string; // URL for the service icon
  iconPlaceholder?: string; // Placeholder if no URL
  usage: string; // e.g., "54.7k"
  // categoryId: string; // To link with McpCategory if filtering is implemented
}

// 示例服务分类数据 (基于图片)
const categoriesData: McpCategory[] = [
  { id: "browser-automation", name: "浏览器自动化", count: 250 },
  { id: "search-tools", name: "搜索工具", count: 452 },
  { id: "collaboration-tools", name: "交流协作工具", count: 181 },
  { id: "developer-tools", name: "开发者工具", count: 946 },
  { id: "entertainment-multimedia", name: "娱乐与多媒体", count: 50 },
  { id: "file-system", name: "文件系统", count: 157 },
  { id: "finance", name: "金融", count: 172 },
  { id: "knowledge-management", name: "知识管理与记忆", count: 204 },
];

// 更新的示例MCP服务数据 (部分基于图片)
const mcpServices: McpService[] = [
  {
    id: "fetch-content",
    name: "Fetch网页内容抓取",
    author: "@modelcontextprotocol/fetch",
    description: "该服务器使大型语言模型能够检索和处理网页内容, 将HTML转换为markdown格式, 以便于更轻松地使用。",
    type: "Hosted",
    iconUrl: "/icons/fetch-logo.png", // 假设有这个图标路径
    iconPlaceholder: "🔗",
    usage: "54.7k",
  },
  {
    id: "leetcode",
    name: "LeetCode(力扣)",
    author: "@jinzcdev/leetcode-mcp-server",
    description: "MCP 服务器实现 LeetCode API 集成, 支持自动化获取编程题库、用户数据和竞赛信息。",
    type: "Hosted",
    iconUrl: "/icons/leetcode-logo.png", // 假设有这个图标路径
    iconPlaceholder: "💻",
    usage: "4.9k",
  },
  {
    id: "amap-maps",
    name: "高德地图",
    author: "@amap/amap-maps",
    description: "高德地图是一个支持任何MCP协议客户端的服务器, 允许用户轻松利用高德地图MCP服务器获取各种基于位置的服务。",
    type: "Hosted",
    iconUrl: "/icons/amap-logo.png", // 假设有这个图标路径
    iconPlaceholder: "🗺️",
    usage: "34.4k",
  },
  {
    id: "bing-search-cn",
    name: "必应搜索中文",
    author: "@yan5236/bing-cn-mcp-server",
    description: "必应搜索中文版MCP服务。",
    type: "Hosted",
    iconUrl: "/icons/bing-logo.png", // 假设有这个图标路径
    iconPlaceholder: "🔍",
    usage: "6.8k",
  },
  {
    id: "alipay-mcp",
    name: "支付宝MCP",
    author: "@alipay/mcp-server-alipay",
    description: "是支付宝开放平台提供的MCP Server, 让你可以轻松将支付宝开放平台提供的交易创建、查询、退款等能力集成到你的LLM应用中。",
    type: "Local",
    iconUrl: "/icons/alipay-logo.png", // 假设有这个图标路径
    iconPlaceholder: "💰",
    usage: "21.5k",
  },
  {
    id: "12306-ticket",
    name: "12306-MCP车票查询工具",
    author: "@Joooook/12306-mcp",
    description: "服务器提供一个简单的API接口, 允许用户搜索12306的车票。",
    type: "Hosted",
    iconUrl: "/icons/12306-logo.png", // 假设有这个图标路径
    iconPlaceholder: "🚆",
    usage: "3.1k",
  },
];

export default function MCPMarketPage() {
  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-screen p-4 bg-slate-100 dark:bg-slate-900">
      {/* Left Sidebar: Categories */}
      <aside className="w-full md:w-64 lg:w-72 xl:w-1/4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md flex-shrink-0">
        <h2 className="text-xl font-semibold mb-5 text-slate-800 dark:text-slate-200 border-b pb-3 dark:border-slate-700">服务分类</h2>
        <nav>
          <ul>
            {categoriesData.map((category) => (
              <li key={category.id} className="mb-1">
                <a
                  href="#" // TODO: Implement category filtering
                  className="flex justify-between items-center p-2.5 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group"
                >
                  <span>{category.name}</span>
                  <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-full group-hover:bg-slate-300 dark:group-hover:bg-slate-500">
                    {category.count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Right Content: Search, Filters, and MCP Services Grid */}
      <main className="flex-1 p-1 md:p-4 overflow-x-hidden">
        {/* Header for Search and Filters */}
        <header className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">MCP 服务</h1>
            {/* Optional: MCP体验 button from image */}
            {/* <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">◇ MCP体验 &gt;</button> */}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full sm:w-auto">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                {/* Heroicon: search */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="搜索MCP服务 (共3197个)" // Placeholder count
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">服务类型:</span>
              <button className="px-3 py-1.5 text-sm rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                Hosted
              </button>
              <button className="px-3 py-1.5 text-sm rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                Local
              </button>
            </div>
          </div>
        </header>

        {/* MCP Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {mcpServices.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 leading-tight">
                    {service.name}
                  </h2>
                  {service.iconUrl ? (
                    <img src={service.iconUrl} alt={`${service.name} icon`} className="w-10 h-10 object-contain ml-3 flex-shrink-0 rounded" />
                  ) : service.iconPlaceholder ? (
                    <span className="text-3xl ml-3 flex-shrink-0">{service.iconPlaceholder}</span>
                  ) : null}
                </div>
                <div className="mb-3">
                  <span
                    className={`text-xs font-medium mr-2 px-2.5 py-1 rounded-full ${
                      service.type === "Hosted"
                        ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                        : "bg-sky-100 text-sky-800 dark:bg-sky-700 dark:text-sky-100"
                    }`}
                  >
                    {service.type} {service.type === "Hosted" && "✓"}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 inline-block">by {service.author}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed h-20 overflow-hidden text-ellipsis"> {/* Fixed height and ellipsis for description */}
                  {service.description}
                </p>
              </div>
              <div className="text-right mt-auto pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {/* Heroicon: eye */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block mr-1 align-text-bottom">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  {service.usage}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}