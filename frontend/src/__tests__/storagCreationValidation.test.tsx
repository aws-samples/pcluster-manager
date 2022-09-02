import {
  canCreateStorage,
  canAttachExistingStorage,
} from '../old-pages/Configure/Storage'
import {UIStorageSettings} from '../old-pages/Configure/Storage.types'

describe('Given a function to determine whether we can create a storage of a given type', () => {
  describe('when the storage type is not available', () => {
    it('should not allow the creation of a new storage', () => {
      expect(canCreateStorage(null as any, {}, {})).toBeFalsy()
    })
  })
  describe('when the storage type does not support creation', () => {
    it('should not allow the creation of a new storage', () => {
      expect(canCreateStorage('FsxOntap', {}, {})).toBeFalsy()
    })
  })
  describe('when the attached storages are not available', () => {
    it('should allow the creation of a new storage', () => {
      expect(canCreateStorage('Efs', {}, {})).toBeTruthy()
    })
  })
  describe('when the ui storages details are not available', () => {
    it('should allow the creation of a new storage', () => {
      expect(canCreateStorage('Efs', {}, null as any)).toBeTruthy()
    })
  })
  describe('when we have exceeded the amount of storage of a given type we can create', () => {
    it('should not allow the creation of a new storage', () => {
      expect(
        canCreateStorage(
          'FsxLustre',
          Array(20)
            .fill({StorageType: 'FsxLustre'})
            .reduce((acc, current, key) => {
              acc[key] = current
              return acc
            }, {}),
          [...Array(20).keys()].reduce<UIStorageSettings>(
            (accumulator, number) => {
              accumulator[number] = {useExisting: false}
              return accumulator
            },
            {},
          ),
        ),
      ).toBeFalsy()
    })
  })
  describe('when we have not exceeded the amount of storage of a given type we can create', () => {
    it('should allow the creation of a new storage', () => {
      expect(
        canCreateStorage(
          'FsxLustre',
          {'0': {StorageType: 'FsxLustre', MountDir: '', Name: ''}},
          {0: {useExisting: true}},
        ),
      ).toBeTruthy()
    })
  })
})

describe('Given a function to determine whether we can attach an existing storage of a given type', () => {
  describe('when the storage type is not available', () => {
    it('should not allow the attachment of an existing storage', () => {
      expect(canAttachExistingStorage(null as any, {}, {})).toBeFalsy()
    })
  })
  describe('when the storage type is not available', () => {
    it('should not allow the attachment of an existing storage', () => {
      expect(canAttachExistingStorage(null as any, {}, {})).toBeFalsy()
    })
  })
  describe('when the attached storages are not available', () => {
    it('should allow the attachment of an existing storage', () => {
      expect(canAttachExistingStorage('Efs', null as any, {})).toBeTruthy()
    })
  })
  describe('when the ui storages details are not available', () => {
    it('should allow the attachment of an existing storage', () => {
      expect(canAttachExistingStorage('Efs', {}, null as any)).toBeTruthy()
    })
  })
  describe('when we have exceeded the amount of existing storage of a given type we can attach', () => {
    it('should not allow the attachment of an existing storage', () => {
      expect(
        canAttachExistingStorage(
          'FsxLustre',
          Array(20)
            .fill({StorageType: 'FsxLustre', Name: '', MountDir: ''})
            .reduce((acc, current, key) => {
              acc[key] = current
              return acc
            }, {}),
          [...Array(20).keys()].reduce<UIStorageSettings>(
            (accumulator, number) => {
              accumulator[number] = {useExisting: true}
              return accumulator
            },
            {},
          ),
        ),
      ).toBeFalsy()
    })
  })
  describe('when we have not exceeded the amount of existing storage of a given type we can attach', () => {
    it('should allow the attachment of an existing storage', () => {
      expect(
        canAttachExistingStorage(
          'FsxLustre',
          {'0': {StorageType: 'FsxLustre', Name: '', MountDir: ''}},
          {0: {useExisting: true}},
        ),
      ).toBeTruthy()
    })
  })
})
