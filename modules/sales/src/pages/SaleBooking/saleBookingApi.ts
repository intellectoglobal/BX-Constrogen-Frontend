import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/sale/booking/'

export interface SaleBooking {
  "key": any
  "docid": any
  "number": any
  "date": any
  "loctyp": any
  "delivnotes": any
  "docstatus": any
  "purtmpl_key": any
  "vend_key": any
  "proj_key": any
  "project": any
  "unit": any
  "projunit_key": any
  "wh_key": any
  "chqdate": any
  "paidamt": any
  "refnumber": any
  "allocatedamt": any
}


export const saleBookingApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listSaleBooking: build.query<ListResponse<SaleBooking>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results.map(({ key }) => ({ type: tags.SALE_BOOKING, key })),
        { type: tags.SALE_BOOKING, id: 'LIST' },
      ] : [{ type: tags.SALE_BOOKING, id: 'LIST' }],
    }),
    addSaleBooking: build.mutation<SaleBooking, Partial<SaleBooking>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.SALE_BOOKING, id: 'LIST' }],
    }),
    getSaleBooking: build.query<SaleBooking, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_SaleBooking, _err, id) => [{ type: tags.SALE_BOOKING, id }],
    }),
    updateSaleBooking: build.mutation<SaleBooking, Partial<SaleBooking>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (payment) => [{ type: tags.SALE_BOOKING, id: payment?.key }],
    }),
    deleteSaleBooking: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (payment) => [{ type: tags.SALE_BOOKING, id: payment?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddSaleBookingMutation,
  useDeleteSaleBookingMutation,
  useGetSaleBookingQuery,
  useListSaleBookingQuery,
  useUpdateSaleBookingMutation,
  useGetErrorProneQuery,
} = saleBookingApi