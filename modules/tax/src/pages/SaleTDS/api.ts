import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';

const API_PATH = '/tax/sale_tds/'

export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listTDSReports: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListTDSReportsQuery,
  useGetErrorProneQuery
} = customApi

