import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { FloorUnitQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/unit/'

export interface ProjectUnit {
  id: string
  key: number
  descr: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
  projblk_key : any
  projflr_key : any
  bedrooms : number | any
  balconies : number | any
  bathrooms : number | any

}

export const projectUnitApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listProjectUnit: build.query<ListResponse<ProjectUnit>, FloorUnitQuery>({
      query: ({ page, size, projectId }) => {
        return {
           url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&project=${projectId || ''}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.PROJECT_UNIT, id })),
        { type: tags.PROJECT_UNIT, id: 'LIST' },
      ] : [{ type: tags.PROJECT_UNIT, id: 'LIST' }],
    }),
    addProjectUnit: build.mutation<ProjectUnit, Partial<ProjectUnit>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.PROJECT_UNIT, id: 'LIST' }],
    }),
    getProjectUnit: build.query<ProjectUnit, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_ProjectUnit, _err, id) => [{ type: tags.PROJECT_UNIT, id }],
    }),
    updateProjectUnit: build.mutation<ProjectUnit, Partial<ProjectUnit>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_UNIT, id: project?.id }],
    }),
    deleteProjectUnit: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.PROJECT_UNIT, id: project?.id }],
    }),
    generateProjectUnits: build.mutation<
        { error: number; detail: string; created_unit_ids?: number[]; floors?: number[] },
        { floors: { key: number; unit_count: number }[]; overwrite?: boolean }
      >({
        query: ({ floors, overwrite }) => ({
          url: `/project/unit/generate/${overwrite ? '?overwrite=1' : ''}`,
          method: 'POST',
          body: { floors },
        }),
        invalidatesTags: [{ type: tags.PROJECT_UNIT, id: 'LIST' }],
      }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddProjectUnitMutation,
  useDeleteProjectUnitMutation,
  useGetProjectUnitQuery,
  useListProjectUnitQuery,
  useUpdateProjectUnitMutation,
  useGenerateProjectUnitsMutation,
  useGetErrorProneQuery,
} = projectUnitApi

export const {
  endpoints: { getProjectUnit },
} = projectUnitApi
