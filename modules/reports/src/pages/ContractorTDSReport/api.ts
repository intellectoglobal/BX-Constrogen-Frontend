import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';


export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listContractorTDSReports: build.query<ListResponse<any>, any>({
      query: ({ page, size, year, month }) => {
        return {
          url: urlUtils('/reports/contractor_tds_report/', `?page=${page || 1}&page_size=${size || PAGE_SIZE}&year=${year}&month=${month}`),
        };
      },
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListContractorTDSReportsQuery,
  useGetErrorProneQuery
} = customApi

