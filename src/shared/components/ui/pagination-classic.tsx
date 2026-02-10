// Copied from Mosaic Next and adapted for React Router
interface PaginationClassicProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PaginationClassic({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPrevious,
  onNext
}: PaginationClassicProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <nav className="mb-4 sm:mb-0 sm:order-1" role="navigation" aria-label="Navigation">
        <ul className="flex justify-center">
          <li className="ml-3 first:ml-0">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`btn border-gray-200 dark:border-gray-700/60 ${
                hasPrevious
                  ? 'bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'
                  : 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              &lt;- Previous
            </button>
          </li>
          <li className="ml-3 first:ml-0">
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`btn border-gray-200 dark:border-gray-700/60 ${
                hasNext
                  ? 'bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300'
                  : 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              Next -&gt;
            </button>
          </li>
        </ul>
      </nav>
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
        Showing <span className="font-medium text-gray-600 dark:text-gray-300">{startItem}</span> to{' '}
        <span className="font-medium text-gray-600 dark:text-gray-300">{endItem}</span> of{' '}
        <span className="font-medium text-gray-600 dark:text-gray-300">{totalItems}</span> results
      </div>
    </div>
  );
}
