import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from 'swr'
import { useForm } from "react-hook-form";
import { ShopLayout } from "@/components/layouts";
import Cookies from "js-cookie";
import { cities, departments } from "@/utils";
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { CartContext } from "@/context";
import axios from "axios";

type FormData = {
  name: string,
  lastName: string,
  department: string,
  city: string,
  address: string,
  neighborhood: string,
  observation?: string,
  phone: string,
}

const getAddressFromCookies = (): FormData => {
  return {
    name: Cookies.get('name') || '',
    lastName: Cookies.get('lastName') || '',
    department: Cookies.get('department') || '',
    city: Cookies.get('city') || '',
    address: Cookies.get('address') || '',
    neighborhood: Cookies.get('neighborhood') || '',
    observation: Cookies.get('observation') || '',
    phone: Cookies.get('phone') || '',
  }
}

const AddressPage = () => {

  const router = useRouter()
  const { updateAddress } = useContext(CartContext)
  const [departmentList, setDepartmentList] = useState(departments)
  const [citiesList, setCitiesList] = useState(cities)
  const [departmentSelect, setDepartmentSelect] = useState("")
  const departmentSelectId: any = departmentList.find((department) => department.name === departmentSelect)?.id

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      lastName: '',
      department: '',
      city: '',
      address: '',
      neighborhood: '',
      observation: '',
      phone: '',
    }
  })

  useEffect(() => {
    const fetchDataDepartment = async () => {
      try {
        const response = await axios.get('https://api-colombia.com/api/v1/Department');
        setDepartmentList(response.data);
      } catch (error) {
        console.error('Error al cargar datos desde la API:', error);
      }
    };

    fetchDataDepartment();
  }, []);

  useEffect(() => {
    const fetchDataCities = async () => {
      try {
        if (departmentSelectId !== undefined) {
          const response = await axios.get(`https://api-colombia.com/api/v1/Department/${departmentSelectId}/cities`);
          setCitiesList(response.data);
        }
      } catch (error) {
        console.error('Error al cargar datos desde la API:', error);
      }
    };

    fetchDataCities();
  }, [departmentSelectId]);


  useEffect(() => {
    reset(getAddressFromCookies())
  }, [reset])

  const onSubmitAddress = (data: FormData) => {
    updateAddress(data)
    router.push('/checkout/summary')
  }

  return (
    <ShopLayout
      title="Direccion"
      pageDescription="Confirmar direccion del destino"
    >
      <Typography variant="h1" component="h1">
        Dirección
      </Typography>

      <form onSubmit={handleSubmit(onSubmitAddress)} noValidate>
        <Grid spacing={2} container sx={{ mt: 2 }}>
          {/* Nombre */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre"
              variant="filled"
              fullWidth
              {
              ...register('name', {
                required: 'Este campo es requerido',
                minLength: { value: 2, message: 'Minimo 2 caracteres' }
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          {/* Apellido */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Apellido"
              variant="filled"
              fullWidth
              {
              ...register('lastName', {
                required: 'Este campo es requerido',
                minLength: { value: 5, message: 'Minimo 5 caracteres' }
              })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>
          {/* Departamento */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                select
                variant="filled"
                label="Departamento"
                defaultValue={Cookies.get('department')}
                {
                ...register('department', {
                  required: 'Este campo es requerido',
                })}
                error={!!errors.department}
                helperText={errors.department?.message}
                onChange={(e) => { setDepartmentSelect(e.target.value) }}
              >
                {
                  departmentList.map(department => (
                    <MenuItem key={department.id} value={department.name}>{department.name}</MenuItem>
                  ))
                }
              </TextField>
            </FormControl>
          </Grid>
          {/* Municipio */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <TextField
                select
                variant="filled"
                label="Municipio"
                disabled={!departmentSelect ? true : false}
                defaultValue={Cookies.get('city')}
                {
                ...register('city', {
                  required: 'Este campo es requerido',
                })}
                error={!!errors.city}
                helperText={errors.city?.message}
              >
                {
                  citiesList.map(city => (
                    <MenuItem key={city.id} value={city.name}>{city.name}</MenuItem>
                  ))
                }
              </TextField>
            </FormControl>
          </Grid>
          {/* Direccion */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Dirección"
              variant="filled"
              fullWidth
              {
              ...register('address', {
                required: 'Este campo es requerido',
              })}
              error={!!errors.address}
              helperText={errors.lastName?.message}
            />
          </Grid>
          {/* Barrio */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Barrio / Conjunto"
              variant="filled"
              fullWidth
              {
              ...register('neighborhood', {
                required: 'Este campo es requerido',
              })}
              error={!!errors.neighborhood}
              helperText={errors.neighborhood?.message}
            />
          </Grid>
          {/* Observaciones */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Observaciones"
              variant="filled"
              fullWidth
              {...register('observation')}
            />
          </Grid>
          {/* Telefono */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Teléfono"
              variant="filled"
              type="number"
              fullWidth
              {
              ...register('phone', {
                required: 'Este campo es requerido',
                minLength: { value: 10, message: 'Minimo 10 numeros' }
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 5 }} display="flex" justifyContent="center">
          <Button color="secondary" className="circular-btn" size="large" type="submit">
            Finalizar pedido
          </Button>
        </Box>
      </form>

    </ShopLayout>
  );
};

export default AddressPage;
