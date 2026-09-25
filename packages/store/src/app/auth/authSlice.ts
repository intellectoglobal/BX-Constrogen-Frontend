import { createSlice } from '@reduxjs/toolkit'
import { authApi } from './authApi'
import type { User } from './authApi'

const initialState = {
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  token: sessionStorage.getItem('token'),
  company_id: sessionStorage.getItem('company_id'),
  company_name: sessionStorage.getItem('company_name'),
  client_id: sessionStorage.getItem('client_id')
} as { user: null | User; 
       token: string | null; 
       company_id: any; 
       company_name: any; 
       client_id: any; 
      }

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      sessionStorage.setItem('token','')
      sessionStorage.setItem('user','null')
      sessionStorage.setItem('client_id','')
      sessionStorage.setItem('company_id','')
      sessionStorage.setItem('company_name','')
    },
    setGlobalCompany : (state,action) => {
      sessionStorage.setItem('company_id',action.payload.id)
      sessionStorage.setItem('company_name',action.payload.name)
      state.company_id = action.payload.company_id
      state.company_name = action.payload.company_name
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state, action) => {
        return
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        let merged = {...action.payload.user, privilege : action.payload.privilage}
        state.user = merged
        state.token = action.payload.token
        if(merged){
          sessionStorage.setItem('user',JSON.stringify(merged))
        }
        if(action.payload.auth_token){
          sessionStorage.setItem('token',JSON.stringify(action.payload.auth_token))
        }
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        return
      })
      .addMatcher(authApi.endpoints.otpLogin.matchPending, (state, action) => {
        return
      })
      .addMatcher(authApi.endpoints.otpLogin.matchFulfilled, (state, action) => {
        let merged = {...action.payload.user, privilege : action.payload.privilage}
        if(merged){
          sessionStorage.setItem('user',JSON.stringify(merged))
        }
        if(action.payload.auth_token){
          sessionStorage.setItem('token',JSON.stringify(action.payload.auth_token))
        }
        sessionStorage.setItem('client_id',action.payload.client_id)
        sessionStorage.setItem('company_id',action.payload.company_id)
        sessionStorage.setItem('company_name',action.payload.company_name)
        state.user = merged
        state.token = action.payload.auth_token
        state.client_id = action.payload.client_id
        state.company_id = action.payload.company_id
        state.company_name = action.payload.company_name
      })
      .addMatcher(authApi.endpoints.otpLogin.matchRejected, (state, action) => {
        return
      })
  },
})

export const { logout, setGlobalCompany } = slice.actions
export default slice.reducer

export const selectCurrentUser = (state: any) => state[slice.name].user
export const selectCompanyId = (state: any) => state[slice.name].company_id
export const selectCompanyName = (state: any) => state[slice.name].company_name
export const selectClientId = (state: any) => state[slice.name].client_id
