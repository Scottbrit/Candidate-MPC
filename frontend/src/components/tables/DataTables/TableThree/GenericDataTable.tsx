import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/tables/DataTables/TableThree/Pagination";

// Types for column configuration
export type ColumnType = "string" | "number" | "action";

export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  type: ColumnType;
  sortable?: boolean;
  formatValue?: (value: unknown) => string | React.ReactNode;
  renderAction?: (item: T, onAction: (action: string, item: T) => void) => React.ReactNode;
  getSortValue?: (item: T) => string | number; // Custom function to get sort value
}

export interface TableConfig<T> {
  columns: ColumnConfig<T>[];
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  searchFields?: (keyof T)[];
}

interface GenericDataTableProps<T> {
  data: T[];
  config: TableConfig<T>;
  onAction?: (action: string, item: T) => void;
}

export function GenericDataTable<T>({
  data,
  config,
  onAction,
}: GenericDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    config.defaultItemsPerPage || 10
  );
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAndSortedData = useMemo(() => {
    return data
      .filter((item) => {
        if (!searchTerm) return true;
        
        // Use searchFields if provided, otherwise use all object values
        if (config.searchFields && config.searchFields.length > 0) {
          return config.searchFields.some((field) => {
            const value = (item as Record<string, unknown>)[field as string];
            return typeof value === "string" &&
              value.toLowerCase().includes(searchTerm.toLowerCase());
          });
        }
        
        // Default behavior: search through all string values
        return Object.values(item as Record<string, unknown>).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (!sortKey) return 0;

        const column = config.columns.find((col) => col.key === sortKey);
        if (!column || !column.sortable) return 0;

        // Use custom getSortValue if available, otherwise use direct property access
        const aValue = column.getSortValue 
          ? column.getSortValue(a)
          : (a as Record<string, unknown>)[sortKey as string];
        const bValue = column.getSortValue 
          ? column.getSortValue(b)
          : (b as Record<string, unknown>)[sortKey as string];

        if (column.type === "number") {
          return sortOrder === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }

        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [data, sortKey, sortOrder, searchTerm, config.columns, config.searchFields]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: keyof T) => {
    const column = config.columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleAction = (action: string, item: T) => {
    if (onAction) {
      onAction(action, item);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400">Show</span>
          <div className="relative z-20 bg-transparent">
            <select
              className="w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {(config.itemsPerPageOptions || [5, 8, 10]).map((value) => (
                <option
                  key={value}
                  value={value}
                  className="text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  {value}
                </option>
              ))}
            </select>
            <span className="absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400">
              <svg
                className="stroke-current"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">entries</span>
        </div>

        <div className="relative">
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none left-4 top-1/2 dark:text-gray-400">
            <svg
              className="fill-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                fill=""
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
          />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {config.columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  isHeader
                  className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]"
                >
                  <div
                    className={`flex items-center justify-between ${
                      column.sortable ? "cursor-pointer" : ""
                    }`}
                    onClick={() => column.sortable && handleSort(column.key as keyof T)}
                  >
                    <p className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">
                      {column.label}
                    </p>
                    {column.sortable && (
                      <button className="flex flex-col gap-0.5">
                        <svg
                          className={`text-gray-300 dark:text-gray-700 ${
                            sortKey === column.key && sortOrder === "asc"
                              ? "text-brand-500"
                              : ""
                          }`}
                          width="8"
                          height="5"
                          viewBox="0 0 8 5"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                            fill="currentColor"
                          />
                        </svg>
                        <svg
                          className={`text-gray-300 dark:text-gray-700 ${
                            sortKey === column.key && sortOrder === "desc"
                              ? "text-brand-500"
                              : ""
                          }`}
                          width="8"
                          height="5"
                          viewBox="0 0 8 5"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item, index) => (
              <TableRow key={index}>
                {config.columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    className="px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap"
                  >
                    {column.type === "action" && column.renderAction
                      ? column.renderAction(item, handleAction)
                      : column.formatValue
                      ? column.formatValue(item)
                      : String((item as Record<string, unknown>)[column.key as string])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between">
          {/* Left side: Showing entries */}
          <div className="pb-3 xl:pb-0">
            <p className="pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left">
              Showing {startIndex + 1} to {endIndex} of {totalItems} entries
            </p>
          </div>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
} 