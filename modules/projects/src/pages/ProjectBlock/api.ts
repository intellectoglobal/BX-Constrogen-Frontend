import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { FloorUnitQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/block/'

export interface ProjectBlock {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const projectBlockApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProjectBlock: build.query<ListResponse<ProjectBlock>, FloorUnitQuery>({
      query: ({ page, size, projectId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      transformResponse(baseQueryReturnValue: ListResponse<any>, meta, arg) {
        baseQueryReturnValue['results'] = baseQueryReturnValue.results.map((d, index) => {
          return {
            ...d,
            sno: index + 1
          }
        })
        return baseQueryReturnValue
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PROJECT_BLOCK, id })),
        { type: tags.PROJECT_BLOCK, id: 'LIST' },
      ] : [{ type: tags.PROJECT_BLOCK, id: 'LIST' }],
    }),
    addProjectBlock: build.mutation<ProjectBlock, Partial<ProjectBlock>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT_BLOCK, id: 'LIST' }],
    }),
    getProjectBlock: build.query<ProjectBlock, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ProjectBlock, _err, id) => [{ type: tags.PROJECT_BLOCK, id }],
    }),
    updateProjectBlock: build.mutation<ProjectBlock, Partial<ProjectBlock>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_BLOCK, id: project?.id }],
    }),
    deleteProjectBlock: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_BLOCK, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddProjectBlockMutation,
  useDeleteProjectBlockMutation,
  useGetProjectBlockQuery,
  useListProjectBlockQuery,
  useUpdateProjectBlockMutation,
  useGetErrorProneQuery,
} = projectBlockApi
