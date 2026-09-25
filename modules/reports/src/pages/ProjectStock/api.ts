import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQueryWithProject, ListResponse } from '@igblsln/model';


export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getProjectStock: build.query<ListResponse<any>, any>({
      query: ({ page, size, projectId, item_type }) => {
        return {
          url: urlUtils("/expense/stock-report/", `?page=${page || 1}&page_size=${size || PAGE_SIZE}${projectId ? `&project_id=${projectId}` : ''}${item_type ? `&item_type=${item_type}` : ''}`),
        };
      }
    }),
    getStockInfo: build.query<any, number>({
      query: (id) => `/expense/stock-report/${id}`,
    }),
    getInvoice: build.query<any, number>({
      query: (id) => `/transaction/vendor/invoice/${id}`,
      providesTags: (_Invoice, _err, id) => [{ type: tags.VENDOR_INVOICE, id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetProjectStockQuery,
  useGetStockInfoQuery,
  useGetInvoiceQuery,
  useGetErrorProneQuery,
} = customApi

