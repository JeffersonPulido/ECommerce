import { db } from '@/database';
import { IUser } from '@/interfaces';
import { User } from '@/models';
import { isValidObjectId } from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    
    switch (req.method) {
        case 'PUT':
            return updateRolUser(req, res)
        default: 
            return res.status(400).json({ message: 'Bad request' });
    }
}
const updateRolUser = async(req: NextApiRequest, res: NextApiResponse) => {
    let { id = '' } = req.body

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: 'ID invalido' });
    }

    await db.connect()

    const userData = await User.findById(id)

    if (!userData) {
        return res.status(400).json({ message: 'No se encuentra ID de usuario' });
    }

    console.log(userData)

    userData.role = 'vendor'
    await userData.save()
    await db.disconnect()

    return res.status(200).json({ message: `Rol de usuario modificado`});

    
}

