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
}

const JobSchema = new Schema<Job>({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  status: { type: String, enum: Object.values(JobStatus), default: JobStatus.CREATED },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: false },
  witness: { type: String },
  proof: { type: String },
  numberOfConstraints: { type: Number },
  r1csScript: { type: String },
})

JobSchema.post('findOneAndUpdate', function (job: Job) {
  const updatedStatus = job.status;
  if (updatedStatus === JobStatus.WITNESS_PROVIDED) {
    informWitnessProvided(job);
  } else if (updatedStatus === JobStatus.COMPLETED) {
    informJobCompleted(job);
  }
});

export const JobModel = mongoose.model<Job>('Job', JobSchema)

export const getJobs = JobModel.find()
export const createJob = (values: Record<string, any>) => new JobModel(values).save()
export const getJobById = (id: Schema.Types.UUID) => JobModel.findById(id)
export const updateJobById = (id: string, values: Record<string, any>): Promise<Job> => JobModel.findOneAndUpdate({ _id: id }, values, { new: true });

const informWitnessProvided = async (job: Job) => {
  await job.populate("worker")
  const worker = job.worker as Worker

  fetch(`${worker.url}/witness`, {
    method: 'POST',
    body: JSON.stringify({
      id: job._id,
      witness: job.witness,
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