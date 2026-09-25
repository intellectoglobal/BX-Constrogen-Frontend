import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { ListResponse } from '@igblsln/model';

const API_PATH = '/estimate/category/'

export interface WorkCategory {
  key: number;
  descr: string;
  created_by: string;
  createddttm: string;
  lastmodified_by: string;
  lastmodifieddttm: string;
  client_id: number;
  // Add other fields as needed
}

export interface WorkCategoryDataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorkCategory[];
}

export const dashboardApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    ListWorkCategoryData: build.query<ListResponse<any>, any>({
      query: ({ page, size }) => ({
        url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
      }),
      providesTags: (result) =>
        result ? [{ type: tags.WORK_CATEGORY, id: 'LIST' }] : [{ type: tags.WORK_CATEGORY, id: 'LIST' }],
    }),

    getWorkCategoryData: build.query<WorkCategoryDataResponse, void>({
      query: () => ({
        url: urlUtils(API_PATH),
      }),
      providesTags: (result) =>
        result ? [{ type: tags.WORK_CATEGORY, id: 'LIST' }] : [{ type: tags.WORK_CATEGORY, id: 'LIST' }],
    }),

    getWorkCategory: build.query<WorkCategoryDataResponse, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_WorkCategoryDataResponse, _err, id) => [{type: tags.WORK_CATEGORY, id}]
    }),

    addWorkCategory: build.mutation<WorkCategoryDataResponse, void> ({
      query: (body) => ({
        url: urlUtils(API_PATH),
        method: "POST",
        body
      }),
      invalidatesTags: [{type: tags.WORK_CATEGORY, id: 'LIST'}]
    }),

    updateWorkCategory: build.mutation<WorkCategory, Partial<WorkCategory>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.WORK_CATEGORY, id: project?.key }],
    }),

    deleteWorkCategory: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.WORK_CATEGORY, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useListWorkCategoryDataQuery,
  useAddWorkCategoryMutation,
  useGetWorkCategoryQuery,
  useUpdateWorkCategoryMutation,
  useDeleteWorkCategoryMutation,
  useGetWorkCategoryDataQuery
} = dashboardApi
