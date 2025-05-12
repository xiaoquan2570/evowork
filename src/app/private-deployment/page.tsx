export default function PrivateDeploymentPage() {
  return (
    <div className="space-y-12">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">企业智能体私有化部署</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">为您的企业量身定制安全、可控、高效的AI解决方案</p>
      </header>

      <section className="bg-white dark:bg-neutral-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-green-600 dark:text-green-400">为什么选择私有化部署？</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">数据安全与合规</h3>
            <p className="text-gray-600 dark:text-gray-400">数据存储在企业内部，完全符合行业监管和数据隐私要求。</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">高度定制化</h3>
            <p className="text-gray-600 dark:text-gray-400">根据企业特定需求定制AI模型和工作流，深度集成现有系统。</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">性能与稳定性</h3>
            <p className="text-gray-600 dark:text-gray-400">独享计算资源，保障服务性能和稳定性，满足高并发需求。</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">自主可控</h3>
            <p className="text-gray-600 dark:text-gray-400">企业对AI系统拥有完全的控制权，方便迭代升级和运维管理。</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 dark:bg-neutral-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6 text-gray-700 dark:text-gray-300">我们的私有化部署流程</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-600 dark:text-gray-400">
          <li><span className="font-semibold">需求沟通与评估：</span>深入了解您的业务场景和技术需求。</li>
          <li><span className="font-semibold">方案设计与定制：</span>制定专属的私有化部署方案和AI模型。</li>
          <li><span className="font-semibold">系统部署与集成：</span>在您的环境中部署AI系统，并与现有IT架构集成。</li>
          <li><span className="font-semibold">测试与上线：</span>进行全面测试，确保系统稳定运行后正式上线。</li>
          <li><span className="font-semibold">培训与支持：</span>提供专业的技术培训和持续的运维支持服务。</li>
        </ol>
      </section>

      <section className="text-center py-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">开启您的企业AI私有化之旅</h2>
        <button className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition duration-300 dark:bg-green-500 dark:hover:bg-green-600">
          获取专属方案
        </button>
      </section>
    </div>
  );
}