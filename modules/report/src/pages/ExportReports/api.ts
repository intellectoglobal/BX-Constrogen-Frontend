import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';


export const customApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listAllReportsToExport: build.query<ListResponse<any>, any>({
      query: ({ year, month, includes }) => {
        return {
          url: urlUtils('/reports/export_report/', `?year=${year}&month=${month}&include=${includes?.join(',')}`),
        };
      },
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListAllReportsToExportQuery,
  useLazyListAllReportsToExportQuery,
  useGetErrorProneQuery
} = customApi

