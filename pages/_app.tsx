import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { SWRConfig } from 'swr'
import { lightTheme } from '@/themes'
import { UiProvider, CartProvider, AuthProvider } from '@/context'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
        <SWRConfig
          value={{
            // refreshInterval: 3000,
            fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
          }}
        >
          <AuthProvider isLoggedIn={false}>
            <CartProvider isLoaded={false} cart={[]} numberOfItems={0} subTotal={0} taxes={0} total={0}>
              <UiProvider isMenuOpen={false}>
                <ThemeProvider theme={lightTheme}>
                  <CssBaseline />
                  <Component {...pageProps} />
                </ThemeProvider>
              </UiProvider>
            </CartProvider>
          </AuthProvider>
        </SWRConfig>
    </SessionProvider>

  )
}
