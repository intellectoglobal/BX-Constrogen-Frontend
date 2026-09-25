import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import store from '../store'

export type AppState = {
    promptNavigate: boolean,
    paymentMenu: string
}

const slice = createSlice({
    name: 'app',
    initialState: { promptNavigate: false, paymentMenu: '' } as AppState,
    reducers: {
        setPromptNavigate: (
            state,
            { payload: { promptNavigate } }: PayloadAction<{ promptNavigate: boolean }>
        ) => {
            state.promptNavigate = promptNavigate
        },
        setPaymentMenu: (state, action) => {
            state.paymentMenu = action.payload
        }
    },
})

export const { setPromptNavigate, setPaymentMenu } = slice.actions

export default slice.reducer

export const selectPromptNavigate = (state: RootState) => state.app.promptNavigate
export const currentPaymentMenu = (state: RootState) => state.app.paymentMenu
