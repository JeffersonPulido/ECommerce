import  { createContext } from 'react'

interface ContextProps {
    isMenuOpen: boolean

    //Metodos

    toggleSideMenu: () => void;
}

export const UiContext = createContext({} as ContextProps)