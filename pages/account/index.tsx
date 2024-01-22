import { useState } from "react";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { ShopLayout } from "@/components/layouts";
import { dbUsers } from "@/database";
import {
    Box,
    Button,
    Chip,
    Divider,
    FormControl,
    Grid,
    ListSubheader,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { IUser } from "@/interfaces";
import { useForm } from "react-hook-form";
import {
    CheckOutlined,
    ErrorOutline,
    TimerOutlined,
    UpdateRounded,
    WarningAmberOutlined,
} from "@mui/icons-material";
import { banks, validations } from "@/utils";
import moment from "moment";
import { shopApi } from "@/axiosApi";

interface FormData {
    _id?: string;
    name: string;
    email: string;
    bank?: string;
    typeAccount?: string;
    numberAccount?: number;
    password?: string;
    createdAt: string;
    role: string;
}

interface Props {
    user: IUser;
}

const ProfilePage: NextPage<Props> = ({ user }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [changeConfirmed, setChangeConfirmed] = useState(false);
    const [messageAlert, setMessageAlert] = useState("");
    const [isError, setIsError] = useState(false);

    const {
        _id,
        name,
        email,
        createdAt,
        password,
        role,
        bank,
        typeAccount,
        numberAccount,
    } = user;

    const formatDate = moment(createdAt).format("DD / MMM / YYYY, h:mm:ss a");

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<FormData>({
        defaultValues: {
            name,
            email,
            createdAt,
            role,
            bank,
            typeAccount,
            numberAccount,
        },
    });

    const onSubmit = async (form: FormData) => {
        setIsSaving(true);
        setChangeConfirmed(false);
        setIsError(false);

        const { name, email, password, bank, numberAccount, typeAccount } =
            form;

        try {
            await shopApi.put("/user/register", {
                name,
                email,
                password,
                bank,
                numberAccount,
                typeAccount,
                _id,
            });

            setChangeConfirmed(true);
            setMessageAlert("El usuario fue actualizado correctamente!");
            setIsError(false);
        } catch (error) {
            console.error("Error de la API. Código de estado:", error);
            if (error) {
                setChangeConfirmed(false);
                setIsSaving(true);
                setMessageAlert(
                    "Ha ocurrido un error actualizando el usuario..."
                );
                setIsError(true);
            }
        }
    };

    return (
        <ShopLayout
            title={"Mi Perfil"}
            pageDescription={`Perfil de usuario en ${process.env.NEXT_PUBLIC_APP_NAME}`}
        >
            <Typography variant="h1" component="h1">
                Mi Perfil
            </Typography>
            <Box
                display="flex"
                justifyContent="center"
                height="calc(100vh - 500px)"
            >
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Box sx={{ width: 350, padding: "10px 20px" }}>
                        <Grid container spacing={2}>
                            <Grid
                                item
                                xs={12}
                                display="flex"
                                justifyContent="center"
                            >
                                <Chip
                                    label={`Creado el ${formatDate}`}
                                    color="success"
                                    variant="outlined"
                                    icon={<TimerOutlined />}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Nombre Completo"
                                    variant="filled"
                                    fullWidth
                                    {...register("name", {
                                        required: "Este campo es requerido",
                                        minLength: {
                                            value: 2,
                                            message: "Minimo 2 caracteres",
                                        },
                                    })}
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={password === "@" ? true : false}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Correo Electronico"
                                    type="email"
                                    variant="filled"
                                    fullWidth
                                    {...register("email", {
                                        required: "Este campo es requerido",
                                        validate: validations.isEmail,
                                    })}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={password === "@" ? true : false}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Rol"
                                    type="text"
                                    variant="filled"
                                    fullWidth
                                    {...register("role")}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Nueva Contraseña"
                                    type="password"
                                    variant="filled"
                                    fullWidth
                                    {...register("password", {
                                        required: "Este campo es requerido",
                                        minLength: {
                                            value: 6,
                                            message: "Minimo 6 caracteres",
                                        },
                                    })}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    disabled={password === "@" ? true : false}
                                />
                            </Grid>
                            {role === "vendor" && (
                                <>
                                    <Divider />
                                    <ListSubheader sx={{ mb: -2 }}>
                                        Informacion Bancaria
                                    </ListSubheader>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <TextField
                                                select
                                                variant="filled"
                                                label="Tipo de cliente"
                                                {...register("typeAccount", {
                                                    required:
                                                        "Es requerido elegir un tipo de cliente",
                                                })}
                                                error={!!errors.typeAccount}
                                                helperText={
                                                    errors.typeAccount?.message
                                                }
                                                defaultValue={getValues(
                                                    "typeAccount"
                                                )}
                                            >
                                                {banks.typeAccount.map(
                                                    (typeAccount) => (
                                                        <MenuItem
                                                            key={typeAccount.id}
                                                            value={
                                                                typeAccount.name
                                                            }
                                                        >
                                                            {typeAccount.name}
                                                        </MenuItem>
                                                    )
                                                )}
                                            </TextField>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <TextField
                                                select
                                                variant="filled"
                                                label="Seleccione el Banco"
                                                {...register("bank", {
                                                    required:
                                                        "Es requerido seleccionar un banco",
                                                })}
                                                error={!!errors.bank}
                                                helperText={
                                                    errors.bank?.message
                                                }
                                                defaultValue={getValues("bank")}
                                            >
                                                {banks.banks.map((bank) => (
                                                    <MenuItem
                                                        key={bank.id}
                                                        value={bank.name}
                                                    >
                                                        {bank.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Numero de cuenta"
                                            type="text"
                                            variant="filled"
                                            fullWidth
                                            {...register("numberAccount", {
                                                required:
                                                    "Este campo es requerido",
                                            })}
                                            error={!!errors.numberAccount}
                                            helperText={
                                                errors.numberAccount?.message
                                            }
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid item xs={12}>
                                {changeConfirmed ? (
                                    <Grid
                                        item
                                        xs={12}
                                        display="flex"
                                        justifyContent="center"
                                    >
                                        <Chip
                                            label={messageAlert}
                                            color="success"
                                            variant="outlined"
                                            icon={<CheckOutlined />}
                                        />
                                    </Grid>
                                ) : password === "@" && role !== "vendor" ? (
                                    <Grid
                                        item
                                        xs={12}
                                        display="flex"
                                        justifyContent="center"
                                    >
                                        <Chip
                                            label="Usuario externo a la aplicación"
                                            color="warning"
                                            variant="outlined"
                                            icon={<WarningAmberOutlined />}
                                        />
                                    </Grid>
                                ) : (
                                    <>
                                        {password === "@" ? (
                                            <>
                                                <Button
                                                    color="secondary"
                                                    className="circular-btn"
                                                    size="large"
                                                    fullWidth
                                                    type="submit"
                                                    startIcon={
                                                        <UpdateRounded />
                                                    }
                                                    disabled={isSaving}
                                                >
                                                    Actualizar
                                                </Button>
                                                <Grid
                                                    item
                                                    xs={12}
                                                    mt={2}
                                                    display="flex"
                                                    justifyContent="center"
                                                >
                                                    <Chip
                                                        label="Usuario externo a la aplicación"
                                                        color="warning"
                                                        variant="outlined"
                                                        icon={
                                                            <WarningAmberOutlined />
                                                        }
                                                    />
                                                </Grid>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    color="secondary"
                                                    className="circular-btn"
                                                    size="large"
                                                    fullWidth
                                                    type="submit"
                                                    startIcon={
                                                        <UpdateRounded />
                                                    }
                                                    disabled={isSaving}
                                                >
                                                    Actualizar
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}
                                {isError ? (
                                    <Grid
                                        item
                                        xs={12}
                                        display="flex"
                                        justifyContent="center"
                                        sx={{ mt: 2 }}
                                    >
                                        <Chip
                                            label={messageAlert}
                                            color="error"
                                            variant="outlined"
                                            icon={<ErrorOutline />}
                                        />
                                    </Grid>
                                ) : (
                                    <></>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </form>
            </Box>
        </ShopLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({
    req,
    query,
}) => {
    const session: any = await getSession({ req });
    if (!session) {
        return {
            redirect: {
                destination: "/auth/login?p=/account/",
                permanent: false,
            },
        };
    }

    const user = await dbUsers.getUserById(session.user._id);

    return {
        props: {
            user,
        },
    };
};

export default ProfilePage;
