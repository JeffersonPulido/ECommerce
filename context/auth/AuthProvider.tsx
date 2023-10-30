import { FC, useReducer, useEffect, Children } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

import Cookies from 'js-cookie';
import axios from 'axios';

import { AuthContext, authReducer } from './';
import shopApi from '@/api/shopApi';
import { IUser } from '@/interfaces';

export interface AuthState {
    children?: React.ReactNode,
    isLoggedIn: boolean,
    user?: IUser
}

const AUTH_INITIAL_STATE: AuthState = {
    isLoggedIn: false,
    user: undefined,
}

export const AuthProvider: FC<AuthState> = ({ children }) => {

    const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE)
    const { data, status } = useSession()
    const router = useRouter()

    //UseEffect for logging with next auth
    useEffect(() => {
        
        if ( status === 'authenticated' ) {
            dispatch({ type: '[Auth] - Login', payload: data?.user as IUser })
        }
    
    }, [ status, data ])
    // useEffect(() => {
    //     checkToken()
    // }, [])
    
    const checkToken = async() => {

        if ( !Cookies.get('token')){
            return
        }

        try {
            const { data } = await shopApi.get('/user/validate-token')
            const { token, user } = data
            Cookies.set('token', token)
            dispatch({ type: '[Auth] - Login', payload: user})
        } catch (error) {
            Cookies.remove('token')
        }
    }

    const loginUser = async( email: string, password: string ): Promise<boolean> => {
        try {
            const { data } = await shopApi.post('/user/login', { email, password })
            const { token, user } = data
            Cookies.set('token', token)
            dispatch({ type: '[Auth] - Login', payload: user})
            return true
        } catch (error) {
            return false
        }
    }

    const registerUser = async(name: string, email:string, password: string): Promise<{hasError: boolean; message?: string}> => {
        try {
            const { data } = await shopApi.post('/user/register', { name, email, password })
            const { token, user } = data
            Cookies.set('token', token)
            dispatch({ type: '[Auth] - Login', payload: user})

            return {
                hasError: false,
            }
            
        } catch (error) {
            if ( axios.isAxiosError(error) ) {
                return {
                    hasError: true,
                    message: error.response?.data.message
                }
            }

            return {
                hasError: true,
                message: 'No se pudo crear el usuario, intente de nuevo'
            }
        }
    }

    const logoutUser = () => {
        Cookies.remove('cart')
        Cookies.remove('name')
        Cookies.remove('lastName')
        Cookies.remove('department')
        Cookies.remove('city')
        Cookies.remove('address')
        Cookies.remove('neighborhood')
        Cookies.remove('observation')
        Cookies.remove('phone')

        signOut()
        // router.reload()
        // Cookies.remove('token')
    }

    return (
        <AuthContext.Provider value={{
            ...state,

            //Methods
            loginUser,
            registerUser,
            logoutUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}