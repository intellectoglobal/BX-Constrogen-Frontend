import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse, EstimationModuleQuery } from '@igblsln/model';

const API_PATH = '/estimation/beam/'

export interface Beam {
  "key" : any
  "name": any
  "base_qty": any
  "projblk_key": any
  "uom_key": any
  "proj_key": any
  "itemtyp_key":any
  "descr": any
  "items" : any[]
}


export const beamApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listBeam: build.query<ListResponse<Beam>, EstimationModuleQuery>({
      query: ({ page, size, projectId, blockId }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}&proj_key=${projectId}&projblk_key=${blockId}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ key }) => ({ type: tags.BEAM, key })),
        { type: tags.BEAM, id: 'LIST' },
      ] : [{ type: tags.BEAM, id: 'LIST' }],
    }),
    addBeam: build.mutation<Beam, Partial<Beam>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.BEAM, id: 'LIST' }],
    }),
    getBeam: build.query<Beam, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Beam, _err, id) => [{ type: tags.BEAM, id }],
    }),
    updateBeam: build.mutation<Beam, Partial<Beam>>({
      query(data) {
        const body = data
        return {
          url: `${API_PATH}`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: (rod) => [{ type: tags.BEAM, id: rod?.key }],
    }),
    deleteBeam: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (rod) => [{ type: tags.BEAM, id: rod?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddBeamMutation,
  useDeleteBeamMutation,
  useGetBeamQuery,
  useListBeamQuery,
  useUpdateBeamMutation,
  useGetErrorProneQuery,
} = beamApi
