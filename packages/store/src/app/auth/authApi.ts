import { retry } from '@reduxjs/toolkit/query/react'
import { api } from '../../service/authApi'
import { tags } from '../../constants'

export interface User {
    first_name: string
    last_name: string
    user_name: string
    email: string
    phone: string,
    privilege : string,
    company : any[]
}

export interface OTPAuth {
    Status: string,
    Details: string,
    otp: string,
    message: string
}

export interface OTPAuthResponse {
    auth_token: string | null, 
    token?: string | null, 
    Status: string; 
    user: User,
    privilage : string
    client_id : any,
    company_id : any,
    company_name : any,
}

export interface OTPAuthPost {
    email: string,
    session_id: string,
    otp: number
}


const API_PATH = '/otp/'

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        otpAuth: build.query<OTPAuth, string>({
            query: (email) => ({
                url: `${API_PATH}`,
                params: { email: email }
            }),

            providesTags: (_Transaction, _err, user) => [{ type: tags.AUTH_OTP, user }],

        }),
        otpLogin: build.mutation<OTPAuthResponse, OTPAuthPost>({
            query: (credentials: OTPAuthPost) => ({
                url: `${API_PATH}`,
                method: 'POST',
                body: credentials,
            }),
            extraOptions: {
                backoff: () => {
                    // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
                    retry.fail({ fake: 'error' })
                },
            },
        }),
        login: build.mutation<{ auth_token: any, token: string; user: User, privilage : string }, any>({
            query: (credentials: any) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
            extraOptions: {
                backoff: () => {
                    // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
                    retry.fail({ fake: 'error' })
                },
            },
        }),
        register: build.mutation<{ user: User }, User>({
            query: (user: User) => ({
                url: '/user/',
                method: 'POST',
                body: user,
            }),
            extraOptions: {
                backoff: () => {
                    // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
                    retry.fail({ fake: 'error' })
                },
            },
        })
    }),
})

export const {
    useLoginMutation,
    useOtpAuthQuery,
    useOtpLoginMutation,
    useRegisterMutation
} = authApi

export const {
    endpoints: { login },
} = authApi
