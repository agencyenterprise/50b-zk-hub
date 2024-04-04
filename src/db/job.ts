import mongoose, { Schema, Document } from "mongoose";
import { Worker } from "./worker";
import { Client } from "./client";

export enum JobStatus {
  CREATED = 'CREATED',
  INPUTS_PROVIDED = 'INPUTS_PROVIDED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Job extends Document {
  client: mongoose.Types.ObjectId | Client;
  status: JobStatus;
  worker?: mongoose.Types.ObjectId | Worker;
  inputs?: String
  proof?: String
  numberOfConstraints: Number
  circomScript: String
}

const JobSchema = new Schema<Job>({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  status: { type: String, enum: Object.values(JobStatus), default: JobStatus.CREATED },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: false },
  inputs: { type: String, required: false },
  proof: { type: String, required: false },
  numberOfConstraints: { type: Number, required: true },
  circomScript: { type: String, required: true },
})

JobSchema.post('findOneAndUpdate', function (job: Job) {
  const updatedStatus = job.status;
  if (updatedStatus === JobStatus.INPUTS_PROVIDED) {
    informInputsProvided(job);
  } else if (updatedStatus === JobStatus.COMPLETED) {
    informJobCompleted(job);
  }
});

export const JobModel = mongoose.model<Job>('Job', JobSchema)

export const getJobs = JobModel.find()
export const createJob = (values: Record<string, any>) => new JobModel(values).save().then(job => job.toObject())
export const getJobById = (id: Schema.Types.UUID) => JobModel.findById(id)
export const updateJobById = (id: string, values: Record<string, any>): Promise<Job> => JobModel.findOneAndUpdate({ _id: id }, values, { new: true });

const informInputsProvided = async (job: Job) => {
  await job.populate("worker")
  const worker = job.worker as Worker

  fetch(`${worker.httpEndpoint}/inputs`, {
    method: 'POST',
    body: JSON.stringify({
      id: job._id,
      inputs: job.inputs,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    if (res.status === 200) {
      updateJobById(job._id, { status: JobStatus.PROCESSING })
    } else {
      updateJobById(job._id, { status: JobStatus.FAILED })
    }
  }).catch((error) => {
    updateJobById(job._id, { status: JobStatus.FAILED })
  })
}

const informJobCompleted = async (job: Job) => {
  await job.populate("client")
  const client = job.client as Client

  fetch(`${client.httpEndpoint}/completed`, {
    method: 'POST',
    body: JSON.stringify({
      id: job._id,
      proof: job.proof,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}