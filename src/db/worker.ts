import mongoose, { Schema } from "mongoose";

enum WorkerStatus {
  AVAILABLE = 'AVAILABLE',
  PROCESSING = 'PROCESSING',
  OFFLINE = 'OFFLINE',
}

export interface Worker extends Document {
  paymentPublicKey: String;
  signingPublicKey: String;
  status: WorkerStatus;
  httpEndpoint: String;
}

const WorkerSchema = new Schema<Worker>({
  paymentPublicKey: { type: String, required: true },
  signingPublicKey: { type: String, required: true },
  status: { type: String, enum: Object.values(WorkerStatus), default: WorkerStatus.AVAILABLE },
})

export const WorkerModel = mongoose.model<Worker>('Worker', WorkerSchema)

export const getWorkers = WorkerModel.find()
export const getWorkerByPaymentPublicKey = (paymentPublicKey: string) => WorkerModel.findOne({ paymentPublicKey })
export const getWorkerBySigningPublicKey = (signingPublicKey: string) => WorkerModel.findOne({ signingPublicKey })
export const createWorker = (values: Record<string, any>) => new WorkerModel(values).save().then(worker => worker.toObject())
export const deleteWorkerByPaymentPublicKey = (paymentPublicKey: string) => WorkerModel.findOneAndDelete({ paymentPublicKey: paymentPublicKey })
export const updateUserByPublicKey = (paymentPublicKey: string, values: Record<string, any>) => WorkerModel.findOneAndUpdate({ paymentPublicKey }, values, { new: true }).then(worker => worker.toObject())