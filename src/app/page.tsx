// Remove existing import Image from "next/image"; if it's the default one and not used below.
// Or keep it if you plan to use Next/Image component.

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-white dark:bg-slate-900">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-blue-600 dark:text-blue-400">EvoWork</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          AI驱动未来工作：雇佣AI数字员工，部署智能工作流，全面提升企业效率。
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          探索解决方案
        </button>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold text-center mb-10 text-slate-800 dark:text-slate-200">核心优势</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">AI数字员工</h3>
            <p className="text-slate-600 dark:text-slate-400">按需雇佣，覆盖多种业务场景，7x24小时不间断服务。</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">智能工作流</h3>
            <p className="text-slate-600 dark:text-slate-400">定制化AI工作流，优化企业内部流程，实现降本增效。</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">私有化部署</h3>
            <p className="text-slate-600 dark:text-slate-400">保障数据安全与合规，深度集成企业现有系统。</p>
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
