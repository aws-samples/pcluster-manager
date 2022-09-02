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

export enum ValidationLevel {
  Error = 'ERROR',
  Info = 'INFO',
  Warning = 'WARNING',
}

export enum CloudFormationStackStatus {
  CreateComplete = 'CREATE_COMPLETE',
  CreateFailed = 'CREATE_FAILED',
  CreateInProgress = 'CREATE_IN_PROGRESS',
  DeleteComplete = 'DELETE_COMPLETE',
  DeleteFailed = 'DELETE_FAILED',
  DeleteInProgress = 'DELETE_IN_PROGRESS',
  RollbackComplete = 'ROLLBACK_COMPLETE',
  RollbackFailed = 'ROLLBACK_FAILED',
  RollbackInProgress = 'ROLLBACK_IN_PROGRESS',
  UpdateComplete = 'UPDATE_COMPLETE',
  UpdateCompleteCleanupInProgress = 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
  UpdateInProgress = 'UPDATE_IN_PROGRESS',
  UpdateRollbackComplete = 'UPDATE_ROLLBACK_COMPLETE',
  UpdateRollbackCompleteCleanupInProgress = 'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
  UpdateRollbackFailed = 'UPDATE_ROLLBACK_FAILED',
  UpdateRollbackInProgress = 'UPDATE_ROLLBACK_IN_PROGRESS',
}

export enum CloudFormationResourceStatus {
  CreateComplete = 'CREATE_COMPLETE',
  CreateFailed = 'CREATE_FAILED',
  CreateInProgress = 'CREATE_IN_PROGRESS',
  DeleteComplete = 'DELETE_COMPLETE',
  DeleteFailed = 'DELETE_FAILED',
  DeleteInProgress = 'DELETE_IN_PROGRESS',
  DeleteSkipped = 'DELETE_SKIPPED',
  ImportComplete = 'IMPORT_COMPLETE',
  ImportFailed = 'IMPORT_FAILED',
  ImportInProgress = 'IMPORT_IN_PROGRESS',
  ImportRollbackComplete = 'IMPORT_ROLLBACK_COMPLETE',
  ImportRollbackFailed = 'IMPORT_ROLLBACK_FAILED',
  ImportRollbackInProgress = 'IMPORT_ROLLBACK_IN_PROGRESS',
  UpdateComplete = 'UPDATE_COMPLETE',
  UpdateFailed = 'UPDATE_FAILED',
  UpdateInProgress = 'UPDATE_IN_PROGRESS',
}

export type Region = string

export type Version = string

// Token to use for paginated requests.
export type PaginationToken = string

export type Tags = Tag[]

export type Tag = {
  // Tag name
  key: string
  // Tag value
  value: string
}

export type ConfigValidationMessage = {
  // Id of the validator.
  id: string
  // Type of the validator.
  type: string
  // Validation level
  level: ValidationLevel
  // Validation message
  message: string
}

export type ValidationMessages = ConfigValidationMessage[]
