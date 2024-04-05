import mongoose from "mongoose";

export interface Client {
  email: string;
  authentication: {
    password: string;
    salt: string;
    sessionToken: string;
    apiKey?: string;
  }
  paymentPublicKey: string;
  httpEndpoint?: string
}

const ClientSchema = new mongoose.Schema({
  email: { type: String, required: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
    apiKey: { type: String, select: false }
  },
  paymentPublicKey: { type: String, required: true },
  httpEndpoint: { type: String, required: false },
})

export const ClientModel = mongoose.model('Client', ClientSchema)

export const getClients = ClientModel.find()
export const getClientById = (id: string) => ClientModel.findById(id)
export const getClientByEmail = (email: string) => ClientModel.findOne({ email })
export const getClientBySessionToken = (sessionToken: string) => ClientModel.findOne({ 
  'authentication.sessionToken': sessionToken 
})
export const getClientByApiKey = (apiKey: string) => ClientModel.findOne({ 
  'authentication.apiKey': apiKey 
})
export const createClient = (values: Record<string, any>) => new ClientModel(values).save().then(client => client.toObject())
export const getClientByPaymentPublicKey = (paymentPublicKey: string) => ClientModel.findOne({ paymentPublicKey })