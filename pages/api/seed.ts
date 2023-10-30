// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db, seedDatabases } from '@/database'
import { Product, User } from '@/models'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if ( process.env.NODE_ENV === 'production') {
    return res.status(401).json({ message: `No tiene acceso a este servicio, ERROR ${res.status}` })
  }

  await db.connect()
  await User.deleteMany()
  await User.insertMany( seedDatabases.initialData.users )

  await Product.deleteMany()
  await Product.insertMany( seedDatabases.initialData.products )
  await db.disconnect()

  res.status(200).json({ message: 'Proceso realizado satisfactoriamente' })
}
