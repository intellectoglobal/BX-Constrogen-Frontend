import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/estimate/type/'

export interface Lead {
  [key: string]: any;
}

export interface WorkTypeData {
  key: any
  total_leads: any
  active_properties: any
  visits?: any
  conversion_rate?: any
  descr:any
  results?: Lead[]
}

type WorkTypeDataResponse = WorkTypeData[]

export const dashboardApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listWorkType: build.query<ListResponse<any>, any>({
      query: ({ page, size, type }) => {
        return {
          // url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&filter=${filter}`),
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}${type ? `&category=${type}` : ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.WORK_TYPE, id })),
        { type: tags.WORK_TYPE, id: 'LIST' },
      ] : [{ type: tags.WORK_TYPE, id: 'LIST' }],
    }),

    getWorkTypeDataWithCateType: build.query<WorkTypeDataResponse, any>({
      query: (type) => ({
        url: urlUtils(API_PATH, `?${type ? `&category=${type}` : ''}&without_pagination=1`),
      }),
      providesTags: (result) =>
        result ? [{ type: tags.WORK_TYPE, id: 'LIST' }] : [{ type: tags.WORK_TYPE, id: 'LIST' }],
    }),
    
    addWorkType: build.mutation<WorkTypeDataResponse, void> ({
      query: (body) => ({
        url: urlUtils(API_PATH),
        method: "POST",
        body
      }),
      invalidatesTags: [{type: tags.WORK_TYPE, id: 'LIST'}]
    }),
    getWorkType: build.query<WorkTypeDataResponse, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_WorkTypeDataResponse, _err, id) => [{type: tags.WORK_TYPE, id}]
    }),
    updateWorkType: build.mutation<WorkTypeDataResponse, Partial<WorkTypeData>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.WORK_TYPE }],
    }),

    deleteWorkType: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.WORK_TYPE, id: project?.id }],
    }),

    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddWorkTypeMutation,
  useGetWorkTypeQuery,
  useUpdateWorkTypeMutation,
  useDeleteWorkTypeMutation,
  useListWorkTypeQuery,
  useGetWorkTypeDataWithCateTypeQuery
} = dashboardApi
