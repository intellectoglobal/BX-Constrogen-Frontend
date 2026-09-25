import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/vendor/ap_term/'

export interface APTerm {
  id: string
  key: number
  descr: string;
  days : any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const apTermApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listAPTerm: build.query<ListResponse<APTerm>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: urlUtils(API_PATH, `?page=${page || 1}&page_size=${size || PAGE_SIZE}`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.results?.map(({ id }) => ({ type: tags.AP_TERM, id })),
        { type: tags.AP_TERM, id: 'LIST' },
      ] : [{ type: tags.AP_TERM, id: 'LIST' }],
    }),
    addAPTerm: build.mutation<APTerm, Partial<APTerm>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.AP_TERM, id: 'LIST' }],
    }),
    getAPTerm: build.query<APTerm, number>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_APTerm, _err, id) => [{ type: tags.AP_TERM, id }],
    }),
    updateAPTerm: build.mutation<APTerm, Partial<APTerm>>({
      query(data) {
        const { key: id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.AP_TERM, id: project?.id }],
    }),
    deleteAPTerm: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.AP_TERM, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddAPTermMutation,
  useDeleteAPTermMutation,
  useGetAPTermQuery,
  useListAPTermQuery,
  useUpdateAPTermMutation,
  useGetErrorProneQuery,
} = apTermApi

export const {
  endpoints: { getAPTerm },
} = apTermApi
