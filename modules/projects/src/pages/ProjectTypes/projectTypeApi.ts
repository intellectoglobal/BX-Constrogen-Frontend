import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/type/'

export interface ProjectType {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const projectTypeApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProjectType: build.query<ListResponse<ProjectType>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PROJECT_TYPES, id })),
        { type: tags.PROJECT_TYPES, id: 'LIST' },
      ] : [{ type: tags.PROJECT_TYPES, id: 'LIST' }],
    }),
    addProjectType: build.mutation<ProjectType, Partial<ProjectType>>({
      query: (body) => ({
        url: API_PATH ,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT_TYPES, id: 'LIST' }],
    }),
    getProjectType: build.query<ProjectType, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ProjectType, _err, id) => [{ type: tags.PROJECT_TYPES, id }],
    }),
    updateProjectType: build.mutation<ProjectType, Partial<ProjectType>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_TYPES, id: project?.id }],
    }),
    deleteProjectType: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_TYPES, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddProjectTypeMutation,
  useDeleteProjectTypeMutation,
  useGetProjectTypeQuery,
  useListProjectTypeQuery,
  useUpdateProjectTypeMutation,
  useGetErrorProneQuery,
} = projectTypeApi

export const {
  endpoints: { getProjectType },
} = projectTypeApi
