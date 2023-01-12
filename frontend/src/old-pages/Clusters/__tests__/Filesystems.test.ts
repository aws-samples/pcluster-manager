import {mock, MockProxy} from 'jest-mock-extended'
import {EC2Instance} from '../../../types/instances'
import {Storages} from '../../Configure/Storage.types'
import {buildFilesystemLink} from '../Filesystems'

describe('given a function to build the link to the filesystem in the AWS console', () => {
  let mockHeadNode: MockProxy<EC2Instance | undefined>
  const mockFileSystem = mock<Storages[0]>({MountDir: 'some-mount-dir'})
  const mockRegion = 'some-region'

  describe('when the headnode configuration is available', () => {
    beforeEach(() => {
      mockHeadNode = mock<EC2Instance>({instanceId: 'some-instance-id'})
    })

    it('should return the link to the filsystem', () => {
      expect(
        buildFilesystemLink(mockRegion, mockHeadNode, mockFileSystem),
      ).toBe(
        'https://some-region.console.aws.amazon.com/systems-manager/managed-instances/some-instance-id/file-system?region=some-region&osplatform=Linux#%7B%22path%22%3A%22some-mount-dir%22%7D',
      )
    })
  })

  describe('when the headnode configuration is not available', () => {
    beforeEach(() => {
      mockHeadNode = undefined
    })

    it('should return null', () => {
      expect(
        buildFilesystemLink(mockRegion, mockHeadNode, mockFileSystem),
      ).toBe(null)
    })
  })
})
