// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

export enum JobStateCode {
  //Job terminated due to launch failure, typically due to a hardware failure ( e.g. unable to boot the node or block and the job can not be requeued).
  BootFail = 'BOOT_FAIL',
  //Job was explicitly cancelled by the user or system administrator. The job may or may not have been initiated.
  Cancelled = 'CANCELLED',
  //Job has terminated all processes on all nodes with an exit code of zero.
  Completed = 'COMPLETED',
  //Job has been allocated resources, but are waiting for them to become ready for use ( e.g. booting).
  Configuring = 'CONFIGURING',
  //Job is in the process of completing. Some processes on some nodes may still be active.
  Completing = 'COMPLETING',
  //Job terminated on deadline.
  Deadline = 'DEADLINE',
  //ob terminated with non-zero exit code or other failure condition.
  Failed = 'FAILED',
  //Job terminated due to failure of one or more allocated nodes.
  NodeFail = 'NODE_FAIL',
  //Job experienced out of memory error.
  OutOfMemory = 'OUT_OF_MEMORY',
  //Job is awaiting resource allocation.
  Pending = 'PENDING',
  //Job terminated due to preemption.
  Preempted = 'PREEMPTED',
  //Job currently has an allocation.
  Running = 'RUNNING',
  //Job is being held after requested reservation was deleted.
  ResvDelHold = 'RESV_DEL_HOLD',
  //Job is being requeued by a federation.
  RequeueFed = 'REQUEUE_FED',
  //Held job is being requeued.
  RequeueHold = 'REQUEUE_HOLD',
  //Completing job is being requeued.
  Requeued = 'REQUEUED',
  //Job is about to change size.
  Resizing = 'RESIZING',
  //Sibling was removed from cluster due to other cluster starting the job.
  Revoked = 'REVOKED',
  //Job is being signaled.
  Signaling = 'SIGNALING',
  //The job was requeued in a special state. This state can be set by users, typically in EpilogSlurmctld, if the job has terminated with a particular exit value.
  SpecialExit = 'SPECIAL_EXIT',
  //Job is staging out files.
  StageOut = 'STAGE_OUT',
  // Job Has An Allocation, But Execution Has Been Stopped With Sigstsignal. Cpus Have Been Retained By This Job.: signal. CPUS have been retained by this job.
  Stopped = 'STOPPED',
  //Job has an allocation, but execution has been suspended and CPUs have been released for other jobs.
  Suspended = 'SUSPENDED',
  //Job terminated upon reaching its time limit.
  Timeout = 'TIMEOUT',
}

export type AccountingJobSummary = {
  name: string
  nodes: string
  partition: string
  state?: {
    current: JobStateCode
    reason: string
  }
  job_id: string
  exit_code: {
    return_code: number
    status: string
  }
  user: string
}

export type JobSummary = {
  job_id: string
  job_state: JobStateCode
  name: string
  nodes: string
  partition: string
  time: string
}

export type Job = {
  Account: string
  AccrueTime: string
  'AllocNode:Sid': string
  BatchFlag: string
  BatchHost: string
  'CPUs/Task': string
  Command: string
  Contiguous: string
  CoreSpec: string
  Deadline: string
  DelayBoot: string
  Dependency: string
  EligibleTime: string
  EndTime: string
  ExcNodeList: string
  ExitCode: string
  Features: string
  GroupId: string
  JobId: string
  JobName: string
  JobState: JobStateCode
  LastSchedEval: string
  Licenses: string
  MCS_label: string
  MinCPUsNode: string
  MinMemoryNode: string
  MinTmpDiskNode: string
  Network: string
  Nice: string
  NodeList: string
  'NtasksPerN:B:S:C': string
  NumCPUs: string
  NumNodes: string
  NumTasks: string
  OverSubscribe: string
  Partition: string
  Power: string
  Priority: string
  QOS: string
  Reason: string
  Reboot: string
  'ReqB:S:C:T': string
  ReqNodeList: string
  Requeue: string
  Restarts: string
  RunTime: string
  Scheduler: string
  SecsPreSuspend: string
  'Socks/Node': string
  StartTime: string
  StdErr: string
  StdIn: string
  StdOut: string
  SubmitTime: string
  SuspendTime: string
  TRES: string
  TimeLimit: string
  TimeMin: string
  UserId: string
  WorkDir: string
}
