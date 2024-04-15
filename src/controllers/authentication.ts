import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { random, authentication, encrypt } from '../helpers';
import { createClient, getClientByEmail, getClientBySessionToken } from '../db/client';

const SECRET = process.env.SECRET

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.sendStatus(400)
    }

    const client = await getClientByEmail(email).select('+authentication.salt +authentication.password')

    if (!client) {
      return res.sendStatus(404)
    }

    const expectedHash = authentication(password, client.authentication.salt)

    if (client.authentication.password !== expectedHash) {
      return res.sendStatus(403)
    }

    const salt = random()
    client.authentication.sessionToken = authentication(salt, client._id.toString())

    await client.save()

    res.cookie("SESSION_TOKEN", client.authentication.sessionToken, { domain: 'localhost', path: '/' })

    return res.status(200).json(client)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, paymentPublicKey } = req.body

    if (!email || !password || !paymentPublicKey) {
      return res.sendStatus(400)
    }

    const existingUser = await getClientByEmail(email)

    if (existingUser) {
      return res.sendStatus(409)
    }

    const salt = random()

    const client = await createClient({
      email,
      authentication: {
        password: authentication(password, salt),
        salt
      },
      paymentPublicKey
    })

    return res.status(201).json(client)
  } catch (error) {
    console.log(error)
    return res.sendStatus(400)
  }
}

export const generateApiToken = async (req: express.Request, res: express.Response) => {
  const sessionToken = req.cookies['SESSION_TOKEN'];

  if (!sessionToken) {
    return res.sendStatus(403);
  }

  const client = await getClientBySessionToken(sessionToken);

  if (!client) {
    return res.sendStatus(401);
  }

  const apiKey: string = uuidv4()
  const encryptedApiKey = encrypt(apiKey, SECRET);
  
  client.authentication.apiKey = encryptedApiKey

  client.save()

  res.status(200).json({
    apiKey
  })
}