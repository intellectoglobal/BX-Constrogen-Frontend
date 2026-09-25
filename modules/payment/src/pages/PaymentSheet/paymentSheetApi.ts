import { api, tags, urlUtils } from '@igblsln/store'

export interface PaymentSheet {
  id: string
  key: number
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const paymentSheetApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listPaymentSheet: build.query<PaymentSheet[], any>({
      query: ({ sheetId }) => {
        return {
          url: urlUtils('/payment/purchase/', `?sheet_id=${sheetId || ''}`),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.PROJECT_PURCHASE_INQUIRY, id } as const)),
        { type: tags.PROJECT_PURCHASE_INQUIRY, id: 'LIST' },
      ],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListPaymentSheetQuery,
  useGetErrorProneQuery
} = paymentSheetApi
