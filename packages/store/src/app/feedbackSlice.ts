import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export type FeedbackState = {
    needsRefresh: boolean
}

const initialState: FeedbackState = {
    needsRefresh: false
}

const feedbackSlice = createSlice({
    name: 'feedback',
    initialState,
    reducers: {
        setFeedbackNeedsRefresh: (state, action: PayloadAction<boolean>) => {
            state.needsRefresh = action.payload
        },
        clearFeedbackRefresh: (state) => {
            state.needsRefresh = false
        }
    },
})

export const { setFeedbackNeedsRefresh, clearFeedbackRefresh } = feedbackSlice.actions

export default feedbackSlice.reducer

export const selectFeedbackNeedsRefresh = (state: RootState) => state.feedback?.needsRefresh || false