import { IUser } from '@/interfaces'
import moongose, { Schema, model, Model } from 'mongoose'

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    role: {
        type: String,
        enum: {
            values: ['admin', 'client', 'super-user', 'SEO', 'vendor'],
            message: '{value} no es un rol valido',
            default: 'client',
            required: true
        }
    }
}, {
    timestamps: true,
})

const User: Model<IUser> = moongose.models.User || model('User', userSchema)

export default User