import { FC, useEffect, useReducer } from 'react'
import Cookie from 'js-cookie'
import { CartContext, cartReducer } from './'
import { ICartProduct, IOrder, ShippingAddress } from '@/interfaces';
import shopApi from '@/api/shopApi';
import axios from 'axios';

export interface CartState {
    children?: React.ReactNode,
    isLoaded: boolean;
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    taxes: number;
    total: number;

    shippingAddress?: ShippingAddress;
}

const CART_INITIAL_STATE: CartState = {
    isLoaded: false,
    cart: Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : [],
    numberOfItems: 0,
    subTotal: 0,
    taxes: 0,
    total: 0,
    shippingAddress: undefined
}

export const CartProvider: FC<CartState> = ({ children }) => {

    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE)

    //Efecto para leer el state.cart de las cookies
    useEffect(() => {
        try {
            const cookieProducts = Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : []
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: cookieProducts });
        } catch (error) {
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: [] });
        }
    }, []);
    //Efecto para leer el shopping address de las cookies
    useEffect(() => {

        if (Cookie.get('name')) {
            const shippingAddress = {
                name: Cookie.get('name') || '',
                lastName: Cookie.get('lastName') || '',
                department: Cookie.get('department') || '',
                city: Cookie.get('city') || '',
                address: Cookie.get('address') || '',
                neighborhood: Cookie.get('neighborhood') || '',
                observation: Cookie.get('observation') || '',
                phone: Cookie.get('phone') || '',
            }

            dispatch({ type: '[Cart] - LoadAddress from Cookies', payload: shippingAddress });
        }

    }, [])
    //Efecto para guardar el state.cart en cookies
    useEffect(() => {
        Cookie.set('cart', JSON.stringify(state.cart));
    }, [state.cart]);
    //Numero de items y total a pagar
    useEffect(() => {
        const numberOfItems = state.cart.reduce((prev, current) => current.quantity + prev, 0)
        const subTotal = state.cart.reduce((prev, current) => (current.price) * (current.quantity) + prev, 0)
        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0)

        const orderSummary = {
            numberOfItems,
            subTotal,
            taxes: subTotal * taxRate,
            total: subTotal * (taxRate + 1)
        }

        dispatch({ type: '[Cart] - Update order summary', payload: orderSummary })

    }, [state.cart]);


    const addProductToCart = (product: ICartProduct) => {

        const productInCart = state.cart.some(p => p._id === product._id)
        if (!productInCart) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] })

        const productInCartButDiferentSize = state.cart.some(p => p._id === product._id && p.size === product.size)
        if (!productInCartButDiferentSize) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] })

        const updatedProducts = state.cart.map(p => {

            if (p._id !== product._id) return p
            if (p.size !== product.size) return p

            //Actualizar cantidad
            p.quantity += product.quantity
            return p
        })

        dispatch({ type: '[Cart] - Update products in cart', payload: updatedProducts })

    }

    const updateCartQuantity = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Change cart quantity', payload: product })
    }

    const removeCartProduct = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Remove product in cart', payload: product })
    }

    const updateAddress = (address: ShippingAddress) => {
        Cookie.set('name', address.name)
        Cookie.set('lastName', address.lastName)
        Cookie.set('department', address.department)
        Cookie.set('city', address.city)
        Cookie.set('address', address.address)
        Cookie.set('neighborhood', address.neighborhood)
        Cookie.set('observation', address.observation || '')
        Cookie.set('phone', address.phone)
        dispatch({ type: '[Cart] - Update Address', payload: address })
    }

    const createOrder = async (): Promise<{ hasError: boolean; message: string; }> => {

        if (!state.shippingAddress) {
            throw new Error('No hay direccion de entrega')
        }

        const body: IOrder = {
            orderItems: state.cart.map(p => ({
                ...p,
                size: p.size!
            })),
            shippingAddress: state.shippingAddress,
            numberOfItems: state.numberOfItems,
            subTotal: state.subTotal,
            tax: state.taxes,
            total: state.total,
            isPaid: false
        }

        try {
            const { data } = await shopApi.post<IOrder>('/orders', body)
            dispatch({ type: '[Cart] - Order complete' })
            return {
                hasError: false,
                message: data._id!
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    hasError: true,
                    message: error.response?.data.message
                }
            }
            return {
                hasError: true,
                message: 'Error no controlado, comuniquese con el administrador'
            }
        }
    }

    return (
        <CartContext.Provider value={{
            ...state,
            //Methods
            addProductToCart,
            updateCartQuantity,
            removeCartProduct,
            updateAddress,

            createOrder
        }}>
            {children}
        </CartContext.Provider>
    )
}