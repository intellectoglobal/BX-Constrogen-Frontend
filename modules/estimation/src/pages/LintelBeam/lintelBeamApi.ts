import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/lintelbeam/'

export interface LintelBeam {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "descr": any
}


export const lintelBeamApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listLintelBeam: build.query<ListResponse<LintelBeam>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.LINTEL_BEAM, key })),
        { type: tags.LINTEL_BEAM, id: 'LIST' },
      ] : [{ type: tags.LINTEL_BEAM, id: 'LIST' }],
    }),
    addLintelBeam: build.mutation<LintelBeam, Partial<LintelBeam>>({
      query: (data) => ({
        url: API_PATH,
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: tags.LINTEL_BEAM, id: 'LIST' }],
    }),
    getLintelBeam: build.query<LintelBeam, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_LintelBeam, _err, id) => [{ type: tags.LINTEL_BEAM, id }],
    }),
    updateLintelBeam: build.mutation<LintelBeam, Partial<LintelBeam>>({
      query(data) {
        return {
          url: `${API_PATH}`,
          method: 'POST',
          data,
        }
      },
      invalidatesTags: (data) => [{ type: tags.LINTEL_BEAM, id: data?.key }],
    }),
    deleteLintelBeam: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (data) => [{ type: tags.LINTEL_BEAM, id: data?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddLintelBeamMutation,
  useDeleteLintelBeamMutation,
  useGetLintelBeamQuery,
  useListLintelBeamQuery,
  useUpdateLintelBeamMutation,
  useGetErrorProneQuery,
} = lintelBeamApi
