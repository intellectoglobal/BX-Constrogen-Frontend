import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store'
import { PagingQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/client/company/'

export interface Company {
  id: number;
  company_name: string;
  role:any;
  company:any;
  client_id:any;
  bank_accounts?:any[]
  project_status:any;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const companyApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    listCompany: build.query<Array<Company>, PagingQuery>({
      query: ({ page, size }) => {
        return {
          url: `${API_PATH}?page=${page || 1}&page_size=${size || PAGE_SIZE}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ id }) => ({ type: tags.COMPANIES, id })),
        { type: tags.COMPANIES, id: 'LIST' },
      ] : [{ type: tags.COMPANIES, id: 'LIST' }],
    }),
    addCompany: build.mutation<Company, Partial<Company>>({
      query: (body) => ({
        url: API_PATH,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: tags.COMPANIES, id: 'LIST' }],
    }),
    getCompany: build.query<Company, any>({
      query: (id) => `${API_PATH}${id}`,
      providesTags: (_Company, _err, id) => [{ type: tags.COMPANIES, id }],
    }),
    updateCompany: build.mutation<Company, Partial<Company>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `${API_PATH}${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (project) => [{ type: tags.COMPANIES, id: project?.id }],
    }),
    deleteCompany: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `${API_PATH}${id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (project) => [{ type: tags.COMPANIES, id: project?.id }],
    }),
    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
})

export const {
  useAddCompanyMutation,
  useDeleteCompanyMutation,
  useGetCompanyQuery,
  useListCompanyQuery,
  useUpdateCompanyMutation,
  useGetErrorProneQuery
} = companyApi

