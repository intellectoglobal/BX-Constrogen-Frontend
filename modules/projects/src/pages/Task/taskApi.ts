import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQueryWithProject, ListResponse } from '@igblsln/model';

const API_PATH = '/project/task/'

export interface Task {
  id?: any
  key?: number
  stages?: any[];
  proj_key?:any;
  project?:any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export interface WorkData {
  id: any
  key: number
  descr: string;
  indexKey?:any;
  stages?:any[];
  contractor_key: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export interface StageData {
  id: any
  key: number
  descr: string;
  tasks?:any[];
  indexKey?:any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export interface TaskData {
  id: any
  key: number
  descr: string;
  startdate?: any
  enddate?: any
}

export const taskApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listTask: build.query<ListResponse<Task>, PagingQueryWithProject>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      transformResponse:(baseQueryReturnValue:ListResponse<Task>, meta, arg) => {
        baseQueryReturnValue['results'] = baseQueryReturnValue.results.map(d =>{
          return{
            ...d,
            proj_key : arg.projectId
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PROJECT_TASK, id })),
        { type: tags.PROJECT_TASK, id: 'LIST' },
      ] : [{ type: tags.PROJECT_TASK, id: 'LIST' }],
    }),
    addTask: build.mutation<Task, Partial<Task>>({
      query: (body) => ({
        url: `${API_PATH}bulk/` ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT_TASK, id: 'LIST' }],
    }),
    getTask: build.query<Task[], number>({
      query: (id) => `${API_PATH}reverse/?project=${id}`,
      providesTags: (_Task, _err, id) => [{ type: tags.PROJECT_TASK, id }],
    }),
    updateTask: build.mutation<any, Partial<Task>>({
      query(data) {
        const { ...body } = data
        return {
          // url: `${API_PATH}bulk/?project=${id}`,
          url: `${API_PATH}bulk/edit/`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (price) => [{ type: tags.PROJECT_TASK, id: price?.id }],
    }),
    deleteTask: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (price) => [{ type: tags.PROJECT_TASK, id: price?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddTaskMutation,
  useDeleteTaskMutation,
  useGetTaskQuery,
  useListTaskQuery,
  useUpdateTaskMutation,
  useGetErrorProneQuery,
} = taskApi