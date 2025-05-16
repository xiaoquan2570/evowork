import Link from 'next/link';

export default function UseCaseDetailPage({ params }: { params: { slug: string } }) {
  const title = params.slug.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return (
    <main className="container mx-auto py-16 px-6 min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-8 md:p-12 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
          用例详情：{title}
        </h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
          这里是关于 &quot;{title}&quot; 应用场景的详细说明、配置方法、以及它如何帮助用户解决特定问题的具体信息。
        </p>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          （此页面为占位符，后续将根据实际用例填充具体内容和交互元素。）
        </p>
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
} 