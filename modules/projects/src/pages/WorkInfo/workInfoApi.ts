import { api, PAGE_SIZE, tags, urlUtils } from '@igblsln/store';
import { AvailabilityQuery, ListResponse } from '@igblsln/model';

const API_PATH = '/project/work/';

export interface Availability {
  id: string;
  key: number;
  descr: string;
  lastmodifiedby?: any;
  lastmodifieddttm?: any;
}

// Renamed from WorkCategory
export interface WorkNameCategory {
  key: number;
  descr: string;
  created_by: string;
  createddttm: string;
  lastmodified_by: string;
  lastmodifieddttm: string;
  client_id: number;
}

// Renamed from WorkCategoryDataResponse
export interface WorkNameCategoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorkNameCategory[];
}

// Renamed from WorkTypeData
export interface WorkNameType {
  key: any;
  total_leads: any;
  active_properties: any;
  visits?: any;
  conversion_rate?: any;
  descr: any;
  results?: [];
}

// Renamed from WorkTypeDataResponse
type WorkNameTypeResponse = WorkNameType[];

export const WorkInfoApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({

  listWorkDetails: build.query<ListResponse<any>, any>({
    query: ({ project, block, category, type }) => {
      return {
        url: urlUtils(
          API_PATH,
          `?project=${project}&block=${block}&category=${category}&type=${type}&without_pagination=1`
        ),
      };
    },
    providesTags: (result) =>
      result?.results
        ? [
            ...result.results.map(({ key }) => ({
              type: "WORK_DETAILS" as const,
              id: key,
            })),
            { type: "WORK_DETAILS", id: "LIST" },
          ]
        : [{ type: "WORK_DETAILS", id: "LIST" }],
  }),

    getWorkNameCategory: build.query<WorkNameCategoryResponse, void>({
      query: () => ({
        url: urlUtils('/estimate/category/'),
      }),
      providesTags: (result) =>
        result ? [{ type: tags.WORK_INFO, id: 'LIST' }] : [{ type: tags.WORK_INFO, id: 'LIST' }],
    }),

    listWorkNameCategory: build.query<any[], void>({
      query: () => ({
        url: urlUtils('/estimate/category/?without_pagination=1'),
      }),
      providesTags: (result) =>
        result ? [{ type: tags.WORK_INFO, id: 'LIST' }] : [{ type: tags.WORK_INFO, id: 'LIST' }],
    }),

    getWorkNameTypeByCategory: build.query<WorkNameTypeResponse, any>({
      query: (type) => ({
        url: urlUtils('/estimate/type/', `?${type ? `&category=${type}` : ''}&without_pagination=1`),
      }),
      providesTags: (result) =>
        result ? [{ type: tags.WORK_INFO, id: 'LIST' }] : [{ type: tags.WORK_INFO, id: 'LIST' }],
    }),

    getErrorProne: build.query<{ success: boolean }, void>({
      query: () => 'error-prone',
    }),
  }),
});

export const {
  useGetErrorProneQuery,
  useGetWorkNameCategoryQuery,
  useGetWorkNameTypeByCategoryQuery,
  useListWorkDetailsQuery,
  useListWorkNameCategoryQuery
} = WorkInfoApi;
