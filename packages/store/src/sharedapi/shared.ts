import { api } from '../service';
import { PAGE_SIZE, tags } from '../constants';
import { urlUtils } from '../util';
import { PagingQuery, ListResponse, ModalBase } from '@igblsln/model';


interface Purposes {
  id: string
  key: number
  descr: string;
  name: string;
  type: string;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export interface ItemSubTypes {
  id: string
  key: number
  descr: string;
  spec_param:string;
  uom_keys:string;
  gst:any;
  itemtyp_key : number;
  lastmodifiedby?: any
  lastmodifieddttm?: any
}

export const shared = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (build) => ({
    getActivePurposes: build.query<Purposes[], void>({
      query: () => {
        return {
          url: `/inventory/purpose/?without_pagination=1`,
        };
      },
    }),
    getPurposesForItemType: build.query<Purposes[], any>({
      query: (itemType) => {
        return {
          url: `/inventory/purpose/?item_type=${itemType}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }: ModalBase) => ({ type: tags.PURPOSES_FOR_ITEM_TYPE, key })),
        { type: tags.PURPOSES_FOR_ITEM_TYPE, key: 'LIST' },
      ] : [{ type: tags.PURPOSES_FOR_ITEM_TYPE, key: 'LIST' }],
    }),
    getItemSubTypesForItemType: build.query<ItemSubTypes[], any>({
      query: (itemType) => {
        return {
          url: `/inventory/item_subtype/?item_type=${itemType}`,
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }: ItemSubTypes) => ({ type: "ItemSubTypeForItemType", key })),
        { type: "ItemSubTypeForItemType", key: 'LIST' },
      ] : [{ type: "ItemSubTypeForItemType", key: 'LIST' }],
    }),
    getSubmittedBookings: build.query<any[], void>({
      query: () => {
        return {
          url: urlUtils(`sale/booking/?status=U`),
        };
      },
      providesTags: (result) => result ? [
        ...result?.map(({ key }) => ({ type: "SubmittedBookings", key })),
        { type: "SubmittedBookings", id: 'LIST' },
      ] : [{ type: "SubmittedBookings", id: 'LIST' }],
    }),
    getAllAPTerm : build.query<any[], void>({
      query: () => {
        return {
          url: urlUtils('/vendor/ap_term/', `?without_pagination=1`),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: tags.AP_TERM, id } as const)),
        { type: tags.AP_TERM, id: 'LIST' },
      ],
    }),
    getAllCompanies : build.query<any[], void>({
      query: () => {
        return {
          url: urlUtils('/client/company/'),
        };
      },
      providesTags: (result = []) => [
        ...result.map(({ key: id }) => ({ type: 'COMPANY', id } as const)),
        { type: 'COMPANY', id: 'LIST' },
      ],
    }),
    listBank: build.query<Array<any>, void>({
      query: () => {
        return {
          url: `/client/bank/?without_pagination=1`,
        };
      },
    }),
  }),
})

export const {
  useGetActivePurposesQuery,
  useGetPurposesForItemTypeQuery,
  useGetItemSubTypesForItemTypeQuery,
  useGetSubmittedBookingsQuery,
  useGetAllAPTermQuery,
  useGetAllCompaniesQuery,
  useListBankQuery
} = shared

