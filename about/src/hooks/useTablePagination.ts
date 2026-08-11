import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

export interface FetchParams {
  pageIndex?: number;
  pageSize?: number;
  [key: string]: any;
}

interface UseTablePaginationProps {
  fetchApi: (params: FetchParams) => Promise<any>;
  defaultPageSize?: number;
  queryKey?: string;
}

const useTablePagination = <T = any>({
  fetchApi,
  defaultPageSize = 10,
  queryKey = 'table-pagination',
}: UseTablePaginationProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const fetchApiRef = useRef(fetchApi);
  const [searchVersion, setSearchVersion] = useState(0);

  useEffect(() => {
    if (fetchApiRef.current !== fetchApi) {
      fetchApiRef.current = fetchApi;
      setPage(1);
      setSearchVersion((prev) => prev + 1);
    }
  }, [fetchApi]);

  const {
    data: result,
    isFetching,
    refetch,
  } = useQuery([queryKey, searchVersion, page, pageSize], () => fetchApi({ pageIndex: page, pageSize }), {
    keepPreviousData: true,
    onError: (err) => console.error('Fetch table data error:', err),
  });

  const onPageChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setPageSize(newSize);
  };

  return {
    data: (result?.data ?? []) as T[],
    total: result?.data?.totalElements ?? 0,
    loading: isFetching,
    page,
    pageSize,
    onPageChange,
    refresh: refetch,
    setPage,
    totalPage: result?.data?.totalPages ?? 0,
  };
};

export default useTablePagination;
