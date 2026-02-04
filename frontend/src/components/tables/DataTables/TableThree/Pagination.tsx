type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  
  const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
  }) => {
    // Calculate which pages to show around current page
    const getVisiblePages = () => {
      const pages: number[] = [];
      
      // If we have 3 or fewer total pages, show all pages
      if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
        return pages;
      }
      
      // For more than 3 pages, show 3 pages around current page
      let startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages, startPage + 2);
      
      // Adjust if we're near the end
      if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      return pages;
    };
    
    const visiblePages = getVisiblePages();
    const showStartEllipsis = visiblePages[0] > 2;
    const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;
  
    return (
      <div className="flex items-center justify-center">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="mr-2.5 flex items-center h-10 justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] text-sm"
        >
          Previous
        </button>
        <div className="flex items-center gap-2">
          {/* Show first page if not in visible range */}
          {showStartEllipsis && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500 text-gray-700 dark:text-gray-400"
              >
                1
              </button>
              <span className="px-2 text-gray-500">...</span>
            </>
          )}
          
          {/* Show visible pages */}
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded ${
                currentPage === page
                  ? "bg-brand-500 hover:bg-brand-100 text-white duration-100"
                  : "text-gray-700 dark:text-gray-400"
              } flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`}
            >
              {page}
            </button>
          ))}
          
          {/* Show last page if not in visible range */}
          {showEndEllipsis && (
            <>
              <span className="px-2 text-gray-500">...</span>
              <button
                onClick={() => onPageChange(totalPages)}
                className="flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500 text-gray-700 dark:text-gray-400"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-2.5 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-gray-700 shadow-theme-xs text-sm hover:bg-gray-50 h-10 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
        >
          Next
        </button>
      </div>
    );
  };
  
  export default Pagination;
  