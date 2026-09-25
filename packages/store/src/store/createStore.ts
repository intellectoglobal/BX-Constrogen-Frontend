import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSlice from '../app/auth/authSlice';
import settingSlice from '../app/setting/settingSlice';
import { api } from '../service/baseApi';
import { api as authApi } from '../service/authApi';
import { IStore } from './IStore';
import appSlice from '../app/appSlice';
import commonSlice from '../service/commonReducers';
import leadFormSlice from '../app/leadFormSlice';
import feedbackSlice from '../app/feedbackSlice';

// Add a dictionary to keep track of the registered async reducers
const asyncReducers: any = {

};
// Define the Reducers that will always be present in the application
const staticReducers = {
  [api.reducerPath]: api.reducer,
  [authApi.reducerPath]: authApi.reducer,
  app: appSlice,
  auth: authSlice,
  settings: settingSlice,
  common : commonSlice,
  leadForm: leadFormSlice,
  feedback: feedbackSlice
}

// Configure the store
export default function createStore(initialState: any): IStore {
  const store = configureStore({
    reducer: staticReducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware, authApi.middleware),
  })

  // Create an inject reducer function
  // This function adds the async reducer, and creates a new combined reducer
  const injectReducer = (key: string, asyncReducer: any) => {
    asyncReducers[key] = asyncReducer
    store.replaceReducer(createReducer(asyncReducers))
  }

  // Return the modified store
  return { ...store, injectReducer }
}

function createReducer(asyncReducers: any): any {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers
  })
}
