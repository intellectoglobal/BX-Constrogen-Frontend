import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';

const API_PATH = '/tax/purchase_gst_entry/'

export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPurchaseGSTEntries: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils('/tax/purchase_gst_entry/', `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
    }),
    listPurchaseGSTReports: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils('/tax/purchase_gst_report/', `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListPurchaseGSTEntriesQuery,
  useListPurchaseGSTReportsQuery,
  useGetErrorProneQuery
} = customApi

