import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
interface State {
  selectedProject : number | null,
}

// Define the initial state using that type
const initialState: State = {
  selectedProject : null
}

export const slice = createSlice({
  name: 'commonData',
  initialState,
  reducers: {
    setSelectedProjectReducer: (state, action: PayloadAction<any>) => {
      state.selectedProject = action.payload
    },
  },
})

export const {
  setSelectedProjectReducer
} = slice.actions

export default slice.reducer