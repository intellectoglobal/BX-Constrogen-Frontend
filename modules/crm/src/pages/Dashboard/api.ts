import { api, tags, urlUtils } from '@igblsln/store'
import { FollowUp } from '../FollowUps/api';
import { SiteVisit } from '../SiteVisits/api';

const API_PATH = '/leads/dashboard/'

export interface Lead {
  [key: string]: any;
}

export interface DashboardData {
  key: any
  total_leads: any
  active_properties: any
  visits?: any
  conversion_rate?: any
  recent_leads?: Lead[]
  today_followups: FollowUp[]
  today_site_visits: SiteVisit[]
}

type DashboardDataResponse = DashboardData

export const dashboardApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getDashboardData: build.query<DashboardDataResponse, void>({
      query: () => ({
        url: urlUtils(API_PATH),
      }),
      providesTags: (result) => result
        ? [{ type: tags.CRM_DASHBOARD, id: 'LIST' }]
        : [{ type: tags.CRM_DASHBOARD, id: 'LIST' }],
    }),
    // getTodaysFollowUps: build.query<FollowUp, void>({
    //   query: () => ({
    //     url: urlUtils(`${API_PATH}today_followups`),
    //   }),
    //   providesTags: (result) => result
    //     ? [{ type: tags.CRM_DASHBOARD, id: 'LIST' }]
    //     : [{ type: tags.CRM_DASHBOARD, id: 'LIST' }],
    // }),
    // getTodaysSiteVisits: build.query<SiteVisit, void>({
    //   query: () => ({
    //     url: urlUtils(`${API_PATH}today_site_visits`),
    //   }),
    //   providesTags: (result) => result
    //     ? [{ type: tags.CRM_DASHBOARD, id: 'LIST' }]
    //     : [{ type: tags.CRM_DASHBOARD, id: 'LIST' }],
    // }),

    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useGetDashboardDataQuery,
  // useGetTodaysFollowUpsQuery,
  // useGetTodaysSiteVisitsQuery
} = dashboardApi
