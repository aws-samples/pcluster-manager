/*
 * Used to configure the Storage part of the Cluster wizard:
 *  - controls whether a storage type can be created or just linked
 *  - specify if a storage type can be mounted as a file system or just one of its volumes
 */
export const STORAGE_TYPE_PROPS = {
  FsxLustre: {
    mountFilesystem: true,
    maxToCreate: 1,
    maxExistingToAttach: 20,
  },
  FsxOntap: {
    mountFilesystem: false,
    maxToCreate: 0,
    maxExistingToAttach: 20,
  },
  FsxOpenZfs: {
    mountFilesystem: false,
    maxToCreate: 0,
    maxExistingToAttach: 20,
  },
  Efs: {
    mountFilesystem: true,
    maxToCreate: 1,
    maxExistingToAttach: 20,
  },
  Ebs: {
    mountFilesystem: false,
    maxToCreate: 5,
    maxExistingToAttach: 5,
  },
}

export type StorageType = keyof typeof STORAGE_TYPE_PROPS

export type Storages = {
  Name: string
  StorageType: StorageType
  MountDir: string
}[]

export type UIStorageSettings = {
  useExisting: boolean
}[]
