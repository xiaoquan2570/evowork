const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-300 text-center p-4 mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} EvoWork. 保留所有权利。</p>
        <p className="text-sm text-neutral-400">AI 时代的工作方式变革者</p>
      </div>
    </footer>
  );
};

export default Footer;