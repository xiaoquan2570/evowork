export default function MCPMarketPage() {
  // 示例MCP服务数据
  const mcpServices = [
    { id: 1, name: "智能情感分析服务", description: "分析文本中的情感倾向，助力舆情监控和用户反馈分析。", category: "自然语言处理" },
    { id: 2, name: "图像识别与打标服务", description: "自动识别图片内容，进行分类和打标，应用于内容审核、智能相册等。", category: "计算机视觉" },
    { id: 3, name: "个性化推荐引擎", description: "基于用户行为和偏好，提供精准的产品或内容推荐。", category: "推荐系统" },
  ];

  return (
    <div className="space-y-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">MCP服务市场</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">发现并集成强大的AI元认知过程（MCP）服务，赋能您的应用</p>
      </header>

      <div className="space-y-6">
        {mcpServices.map((service) => (
          <div key={service.id} className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-1 text-indigo-600 dark:text-indigo-400">{service.name}</h2>
            <span className="text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-1 rounded-full mb-3 inline-block">{service.category}</span>
            <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
            <button className="mt-4 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 transition duration-300 dark:bg-indigo-600 dark:hover:bg-indigo-700">
              查看详情
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}