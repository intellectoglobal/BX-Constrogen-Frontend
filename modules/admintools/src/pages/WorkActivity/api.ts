import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store';
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/estimate/activity/';

export interface Lead {
  [key: string]: any;
}

export interface WorkActivity {
  key: any;
  total_leads: any;
  active_properties: any;
  visits?: any;
  conversion_rate?: any;
  descr: any;
  results?: Lead[];
  work_category: any,
  work_type:any
}

type WorkActivityResponse = WorkActivity[]; // For list responses

export const dashboardApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({

    // ✅ LIST all work activities
    listWorkActivity: build.query<ListResponse<any>, any>({
      query: ({ page, size, workCategory, workType }) => ({
        url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${workCategory ? `&category=${workCategory}` : ''}${workType ? `&type=${workType}` : ''}`),
      }),
      providesTags: (result) => result
        ? [
            ...result.results.map(({ id }) => ({ type: tags.WORK_ACTIVITY, id })),
            { type: tags.WORK_ACTIVITY, id: 'LIST' },
          ]
        : [{ type: tags.WORK_ACTIVITY, id: 'LIST' }],
    }),

    // ✅ ADD single work activity
    addWorkActivity: build.mutation<WorkActivity, Partial<WorkActivity>>({
      query: (body) => ({
        url: urlUtils(API_PATH),
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.WORK_ACTIVITY, id: 'LIST' }],
    }),

    // ✅ GET single work activity
    getWorkActivity: build.query<WorkActivity, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_result, _err, id) => [{ type: tags.WORK_ACTIVITY, id }],
    }),

    // ✅ UPDATE single work activity
    updateWorkActivity: build.mutation<WorkActivity, Partial<WorkActivity>>({
      query(data) {
        const { key: id, ...body } = data;
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: [{ type: tags.WORK_ACTIVITY, id: 'LIST' }],
    }),

    // ✅ DELETE single work activity
    deleteWorkActivity: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_result, _err, id) => [{ type: tags.WORK_ACTIVITY, id }],
    }),

    // Optional dummy error-prone test
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
});

export const {
  useAddWorkActivityMutation,
  useGetWorkActivityQuery,
  useUpdateWorkActivityMutation,
  useDeleteWorkActivityMutation,
  useListWorkActivityQuery,
} = dashboardApi;
