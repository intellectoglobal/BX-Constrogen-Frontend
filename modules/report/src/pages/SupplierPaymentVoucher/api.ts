import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';


export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSupplierPaymentVoucherReports: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils('/reports/supplier_payment_vouchers/', `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListSupplierPaymentVoucherReportsQuery,
  useGetErrorProneQuery
} = customApi

