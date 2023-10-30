import { useContext, useState } from "react"
import { AuthContext, UiContext } from "@/context"
import { useRouter } from "next/router"
import { Box, Button, Divider, Drawer, IconButton, Input, InputAdornment, Link, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Typography } from "@mui/material"
import { AccountCircleOutlined, AdminPanelSettings, CategoryOutlined, ConfirmationNumberOutlined, DashboardOutlined, EscalatorWarningOutlined, FemaleOutlined, LoginOutlined, MaleOutlined, OutboxOutlined, SearchOutlined, VpnKeyOutlined } from "@mui/icons-material"
import { shopApi } from "@/api"


export const SideMenu = () => {

    const router = useRouter()
    const { isMenuOpen, toggleSideMenu } = useContext(UiContext)
    const { user, isLoggedIn, logoutUser } = useContext(AuthContext)

    const [searchTerm, setSearchTerm] = useState("")
    const [messageOperation, setMessageOperation] = useState('')

    const onSearchTerm = () => {
        if (searchTerm.trim().length === 0) return
        navigateTo(`/search/${searchTerm}`)
    }

    const onChangeRole = async (id: string) => {
        try {
            const { status } = await shopApi.put(`/user/changeRole/`, { id })
            if (status === 200) {
                setMessageOperation('¡Genial! Desde tu proximo inicio de sesion podrás hacerlo.')
            } else {
                setMessageOperation('Algo ha salido mal.')
            }
        } catch (error) {
            console.log(error)
        }
    }

    const navigateTo = (url: string) => {
        toggleSideMenu()
        router.push(url)
    }

    return (
        <Drawer
            open={isMenuOpen}
            anchor='right'
            sx={{ backdropFilter: 'blur(4px)', transition: 'all 0.5s ease-out' }}
            onClose={toggleSideMenu}
        >
            <Box sx={{ width: 250, paddingTop: 5 }}>

                <List>
                    {/** Search input */}
                    <ListItem>
                        <Input
                            autoFocus
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' ? onSearchTerm() : null}
                            type='text'
                            placeholder="Buscar..."
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={onSearchTerm}
                                    >
                                        <SearchOutlined />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </ListItem>
                    {/** Perfil and Orders - ONLY IS LOGGED and Products if role vendor */}
                    {
                        isLoggedIn && (
                            <>
                                <ListItem button onClick={() => navigateTo('/account/')}>
                                    <ListItemIcon>
                                        <AccountCircleOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Perfil'} />
                                </ListItem>

                                <ListItem button onClick={() => navigateTo('/orders/history')}>
                                    <ListItemIcon>
                                        <ConfirmationNumberOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Mis Ordenes'} />
                                </ListItem>
                                {/** Products - ONLY IS LOGGED VENDOR ROLE */}
                                {
                                    (user?.role === 'vendor' || user?.role === 'admin') && (
                                        <ListItem button onClick={() => navigateTo('/product/listProducts')}>
                                            <ListItemIcon>
                                                <CategoryOutlined />
                                            </ListItemIcon>
                                            <ListItemText primary={'Mis Productos'} />
                                        </ListItem>
                                    )
                                }
                            </>
                        )
                    }
                    {/** Categories */}
                    <ListItem
                        button
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/men')}
                    >
                        <ListItemIcon>
                            <MaleOutlined />
                        </ListItemIcon>
                        <ListItemText primary={'Hombres'} />
                    </ListItem>

                    <ListItem
                        button
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/women')}
                    >
                        <ListItemIcon>
                            <FemaleOutlined />
                        </ListItemIcon>
                        <ListItemText primary={'Mujeres'} />
                    </ListItem>

                    <ListItem
                        button
                        sx={{ display: { xs: '', sm: 'none' } }}
                        onClick={() => navigateTo('/category/kid')}
                    >
                        <ListItemIcon>
                            <EscalatorWarningOutlined />
                        </ListItemIcon>
                        <ListItemText primary={'Niños'} />
                    </ListItem>
                    {/** LOGIN or LOGOUT */}
                    {
                        isLoggedIn
                            ? (
                                <ListItem button onClick={logoutUser}>
                                    <ListItemIcon>
                                        <LoginOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Salir'} />
                                </ListItem>
                            )
                            : (
                                <ListItem button onClick={() => navigateTo(`/auth/login?p=${router.asPath}`)}>
                                    <ListItemIcon>
                                        <VpnKeyOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Ingresar'} />
                                </ListItem>
                            )
                    }

                    {/* Admin */}
                    {
                        user?.role === 'admin' && (
                            <>
                                <Divider />
                                <ListSubheader>Admin Panel</ListSubheader>

                                <ListItem
                                    button
                                    onClick={() => navigateTo(`/admin/`)}
                                >
                                    <ListItemIcon>
                                        <DashboardOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Dashboard'} />
                                </ListItem>

                                <ListItem
                                    button
                                    onClick={() => navigateTo(`/admin/products`)}
                                >
                                    <ListItemIcon>
                                        <CategoryOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Productos'} />
                                </ListItem>

                                <ListItem
                                    button
                                    onClick={() => navigateTo(`/admin/orders`)}
                                >
                                    <ListItemIcon>
                                        <ConfirmationNumberOutlined />
                                    </ListItemIcon>
                                    <ListItemText primary={'Ordenes'} />
                                </ListItem>

                                <ListItem
                                    button
                                    onClick={() => navigateTo(`/admin/users`)}
                                >
                                    <ListItemIcon>
                                        <AdminPanelSettings />
                                    </ListItemIcon>
                                    <ListItemText primary={'Usuarios'} />
                                </ListItem>
                            </>
                        )
                    }

                    {/* Change to vendor */}
                    {
                        user?.role === 'client' && (
                            <>
                                <Divider />
                                <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' mt={2}>
                                    <Typography variant="caption">¿Deseas vender tus productos aqui?</Typography>
                                    {
                                        messageOperation
                                            ? (
                                                <Typography mt={2} align="center" variant="caption">{messageOperation}</Typography>
                                            )
                                            : (
                                                <Button
                                                    onClick={() => onChangeRole(user._id)}
                                                    variant="contained"
                                                    color="primary"
                                                    className="circular-btn"
                                                >
                                                    ¡Clic aqui!
                                                </Button>
                                            )
                                    }
                                </Box>
                            </>
                        )
                    }

                </List>
            </Box>
        </Drawer>
    )
}