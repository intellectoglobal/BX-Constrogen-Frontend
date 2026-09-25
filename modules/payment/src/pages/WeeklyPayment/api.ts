import { api, tags, urlUtils } from '@igblsln/store'

export interface WeeklyPayment {
  id: string
  key: number
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const weeklyPaymentApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listWeeklyPurchasePayment: build.query<WeeklyPayment[], any>({
      query: ({ weeklyId }) => {
        return {
          url: urlUtils('/payment/purchase/', `?weekly_id=${weeklyId || ''}`),
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
  useListWeeklyPurchasePaymentQuery,
  useGetErrorProneQuery
} = weeklyPaymentApi
