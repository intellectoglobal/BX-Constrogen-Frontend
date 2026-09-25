import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';

const API_PATH = '/tax/sales_gst_entry/'

export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSaleGSTEntries: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
    }),
    listSaleGSTReports: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils('/tax/sales_gst_report/', `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListSaleGSTEntriesQuery,
  useListSaleGSTReportsQuery,
  useGetErrorProneQuery
} = customApi

