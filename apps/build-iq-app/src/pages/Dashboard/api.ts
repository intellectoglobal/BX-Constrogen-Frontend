import { api, tags } from '@igblsln/store'

const API_PATH = '/dashboard/'

export interface DashboardSummary {
  active_projects: number
  pending_pos: number
  vendor_pending_payments: number
  contractor_pending_payments: number
}

export const dashboardApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getDashboardSummary: build.query<DashboardSummary, void>({
      query: () => ({
        url: API_PATH,
      }),
      providesTags: [{ type: tags.DASHBOARD, id: 'SUMMARY' }],
    }),
  }),
})

export const {
  useGetDashboardSummaryQuery,
} = dashboardApi

export const {
  endpoints: { getDashboardSummary },
} = dashboardApi
