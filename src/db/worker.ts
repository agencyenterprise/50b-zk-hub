import mongoose, { Schema } from "mongoose";

export enum WorkerStatus {
  AVAILABLE = 'AVAILABLE',
  PROCESSING = 'PROCESSING',
  OFFLINE = 'OFFLINE',
}

export interface Worker extends Document {
  wallet: String;
  signingPublicKey: String;
  status: WorkerStatus;
  url: String;
}

const WorkerSchema = new Schema<Worker>({
  wallet: { type: String, required: true },
  signingPublicKey: { type: String, required: true },
  status: { type: String, enum: Object.values(WorkerStatus), default: WorkerStatus.AVAILABLE },
  url: { type: String, required: true },
})

export const WorkerModel = mongoose.model<Worker>('Worker', WorkerSchema)

export const getWorkers = WorkerModel.find()
export const getWorkerByPaymentPublicKey = (paymentPublicKey: string) => WorkerModel.findOne({ paymentPublicKey })
export const getWorkerBySigningPublicKey = (signingPublicKey: string) => WorkerModel.findOne({ signingPublicKey })
export const getAvailableWorkers = () => WorkerModel.find({ status: WorkerStatus.AVAILABLE })
export const createWorker = (values: Record<string, any>) => new WorkerModel(values).save().then(worker => worker.toObject())
export const deleteWorkerByPaymentPublicKey = (paymentPublicKey: string) => WorkerModel.findOneAndDelete({ paymentPublicKey: paymentPublicKey })
export const updateUserByPublicKey = (paymentPublicKey: string, values: Record<string, any>) => WorkerModel.findOneAndUpdate({ paymentPublicKey }, values, { new: true }).then(worker => worker.toObject())