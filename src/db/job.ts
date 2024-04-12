import mongoose, { Schema, Document } from "mongoose";
import { Worker } from "./worker";
import { Client } from "./client";

export enum JobStatus {
  CREATED = 'CREATED',
  WITNESS_PROVIDED = 'WITNESS_PROVIDED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Job extends Document {
  client: mongoose.Types.ObjectId | Client;
  status: JobStatus;
  worker?: mongoose.Types.ObjectId | Worker;
  witness?: String
  proof?: String
  numberOfConstraints?: Number
  r1csScript?: String
  aesKey?: String
  aesIv?: String
}

const JobSchema = new Schema<Job>({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  status: { type: String, enum: Object.values(JobStatus), default: JobStatus.CREATED },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: false },
  witness: { type: String },
  proof: { type: String },
  numberOfConstraints: { type: Number },
  r1csScript: { type: String },
  aesKey: { type: String },
  aesIv: { type: String },
})

export const JobModel = mongoose.model<Job>('Job', JobSchema)

export const getJobs = JobModel.find()
export const createJob = (values: Record<string, any>) => new JobModel(values).save()
export const getJobById = (id: Schema.Types.UUID) => JobModel.findById(id)
export const updateJobById = (id: string, values: Record<string, any>): Promise<Job> => JobModel.findOneAndUpdate({ _id: id }, values, { new: true });
