import { useEffect, useState } from 'react';
import shopApi from '@/axiosApi/shopApi';
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid"
import useSWR from 'swr';
import { IUser } from '@/interfaces';
import { Grid, MenuItem, Select } from '@mui/material'
import { PeopleOutline } from '@mui/icons-material'
import { AdminLayout } from '@/components/layouts'
import { typeAccount } from '../../utils/banks';

const UsersPage = () => {

    const { data, error } = useSWR<IUser[]>('/api/admin/users')
    const [users, setUsers] = useState<IUser[]>([])

    useEffect(() => {
        if (data) {
            setUsers(data)
        }
    }, [data])


    if (!data && !error) return (<></>)

    const onRolUpdated = async (userId: string, newRole: string) => {
        const previusUsers = users.map(user => ({ ...user }))
        const updatedUsers = users.map(user => ({
            ...user,
            role: userId === user._id ? newRole : user.role
        }))
        setUsers(updatedUsers)
        try {
            await shopApi.put('/admin/users/', { userId, role: newRole })
        } catch (error) {
            setUsers(previusUsers)
            console.log(error)
            alert('No se pudo actualizar el rol del usuario')
        }
    }

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 210 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'name', headerName: 'Nombre Completo', width: 210 },
        { field: 'bank', headerName: 'Banco', width: 150 },
        { field: 'typeAccount', headerName: 'Tipo Cliente', width: 100 },
        { field: 'numberAccount', headerName: 'Numero Cuenta', width: 200 },
        {
            field: 'role',
            headerName: 'Rol',
            width: 250,
            renderCell: ({ row }: GridRenderCellParams) => {
                return (
                    <Select
                        value={row.role}
                        label='Rol'
                        sx={{ width: '100%' }}
                        onChange={({ target }) => onRolUpdated(row.id, target.value)}
                    >
                        <MenuItem value='admin'>Admin</MenuItem>
                        <MenuItem value='client'>Cliente</MenuItem>
                        <MenuItem value='vendor'>Vendedor</MenuItem>
                        <MenuItem value='super-user'>Super User</MenuItem>
                        <MenuItem value='SEO'>SEO</MenuItem>
                    </Select>
                )
            }
        },
    ]

    const rows = users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        bank: user.bank,
        typeAccount: user.typeAccount,
        numberAccount: user.numberAccount,
        role: user.role
    }))

    return (
        <AdminLayout title={'Usuarios'} subTitle={'Mantenimiento de usuarios'} icon={<PeopleOutline />}>
            <Grid container className="fadeIn">
                <Grid item xs={12} sx={{ height: 650, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                    />
                </Grid>
            </Grid>
        </AdminLayout>
    )
}

export default UsersPage