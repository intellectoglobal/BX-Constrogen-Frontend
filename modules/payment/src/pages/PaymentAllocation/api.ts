import { api, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from 'model/dist';

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
    listVendorPayment1: build.query<ListResponse<any>, any>({
      query: ({ }) => {
        return {
          url: urlUtils('/vendor/vendor/'),
        };
      },
      transformResponse(baseQueryReturnValue: ListResponse<any>, meta, arg) {
        baseQueryReturnValue['results'] = baseQueryReturnValue.results.filter(d => {
          return d?.type?.contractor !== "Y"
        }).map((d, index) => {
          return {
            ...d,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.VENDOR, id })),
        { type: tags.VENDOR, id: 'LIST' },
      ] : [{ type: tags.VENDOR, id: 'LIST' }],
    }),
    listContractorPayment1: build.query<ListResponse<any>, any>({
      query: ({}) => {
        return {
          url: urlUtils('/vendor/vendor/'),
        };
      },
      transformResponse: (baseQueryReturnValue: ListResponse<any>, meta, arg) => {
        baseQueryReturnValue['results'] = baseQueryReturnValue.results.filter(d => {
          return d?.type?.contractor === "Y"
        }).map((d, index) => {
          return {
            ...d,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.CONTRACTOR, id })),
        { type: tags.CONTRACTOR, id: 'LIST' },
      ] : [{ type: tags.CONTRACTOR, id: 'LIST' }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListVendorPayment1Query,
  useListContractorPayment1Query,
  useGetErrorProneQuery
} = weeklyPaymentApi
