export default function AgentsPage() {
  // 示例Agent数据，未来可以从Supabase获取
  const agents = [
    { id: 1, name: "智能客服Agent", description: "提供7x24小时客户支持，解答常见问题，处理用户请求。", icon: "🤖" },
    { id: 2, name: "数据分析Agent", description: "自动收集、处理和分析数据，生成洞察报告，辅助决策。", icon: "📊" },
    { id: 3, name: "内容创作Agent", description: "根据需求生成文章、营销文案、社交媒体帖子等内容。", icon: "✍️" },
    { id: 4, name: "项目管理Agent", description: "协助跟踪项目进度，分配任务，提醒截止日期。", icon: "📋" },
  ];

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">数字人Agent展示</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">探索EvoWork提供的各类高效AI数字员工</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">{agent.icon}</div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-600 dark:text-blue-400">{agent.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{agent.description}</p>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 dark:bg-blue-600 dark:hover:bg-blue-700">
              了解更多
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}