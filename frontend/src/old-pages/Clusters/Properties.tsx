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
import {ClusterStatus, ClusterDescription} from '../../types/clusters'
import React from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {findFirst, clusterDefaultUser} from '../../util'
import {
  getState,
  useState,
  setState,
  ssmPolicy,
  consoleDomain,
} from '../../store'
import {DescribeCluster} from '../../model'

// UI Elements
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  Link,
  Popover,
  SpaceBetween,
  StatusIndicator,
} from '@cloudscape-design/components'

// Components
import ConfigDialog from './ConfigDialog'
import DateView from '../../components/DateView'
import {
  ClusterStatusIndicator,
  ComputeFleetStatusIndicator,
} from '../../components/Status'
import HelpTooltip from '../../components/HelpTooltip'

// Key:Value pair (label / children)
const ValueWithLabel = ({label, children}: any) => (
  <div>
    <Box margin={{bottom: 'xxxs'}} color="text-label">
      {label}
    </Box>
    <div>{children}</div>
  </div>
)

export default function ClusterProperties() {
  const {t} = useTranslation()
  const clusterName = useState(['app', 'clusters', 'selected'])
  const clusterPath = ['clusters', 'index', clusterName]
  const cluster: ClusterDescription = useState(clusterPath)
  const headNode = useState([...clusterPath, 'headNode'])
  const defaultRegion = useState(['aws', 'region'])
  const region = useState(['app', 'selectedRegion']) || defaultRegion

  function isSsmPolicy(p: any) {
    return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy(region)
  }
  const iamPolicies = useState([
    ...clusterPath,
    'config',
    'HeadNode',
    'Iam',
    'AdditionalIamPolicies',
  ])
  const ssmEnabled = iamPolicies && findFirst(iamPolicies, isSsmPolicy)

  React.useEffect(() => {
    const tick = () => {
      const clusterName = getState(['app', 'clusters', 'selected'])
      clusterName && DescribeCluster(clusterName)
    }
    const timerId = setInterval(tick, 5000)
    return () => {
      clearInterval(timerId)
    }
  }, [])

  return (
    <>
      <ConfigDialog />
      <Container header={<Header variant="h3">Properties</Header>}>
        <ColumnLayout columns={3} variant="text-grid">
          <SpaceBetween size="l">
          { headNode && headNode.publicIpAddress && (
            <ValueWithLabel label={t('cluster.properties.sshcommand.label')}>
              <div className="custom-wrapping">
                <Box margin={{right: 'xxs'}} display="inline-block">
                  <Popover
                    size="small"
                    position="top"
                    dismissButton={false}
                    triggerType="custom"
                    content={
                      <StatusIndicator type="success">
                        {t('cluster.properties.sshcommand.success')}
                      </StatusIndicator>
                    }
                  >
                    <Button
                      variant="inline-icon"
                      iconName="copy"
                      ariaLabel={t('cluster.properties.sshcommand.help')}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `ssh ${clusterDefaultUser(cluster)}@${headNode.publicIpAddress}`
                        )
                      }}
                    >
                      copy
                    </Button>
                  </Popover>
                </Box>
                ssh {clusterDefaultUser(cluster)}@{headNode.publicIpAddress}
                <HelpTooltip>
                  <Trans i18nKey="cluster.properties.sshcommand.tooltiptext">
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html#AccessingInstancesLinuxSSHClient"
                    ></a>
                  </Trans>
                </HelpTooltip>
              </div>
            </ValueWithLabel>
            )}
            <ValueWithLabel label="clusterConfiguration">
              <Button
                disabled={cluster.clusterStatus === ClusterStatus.CreateFailed}
                iconName="external"
                onClick={() =>
                  setState(['app', 'clusters', 'clusterConfig', 'dialog'], true)
                }
              >
                View
              </Button>
            </ValueWithLabel>
          </SpaceBetween>
          <SpaceBetween size="l">
            <ValueWithLabel label="clusterStatus">
              <ClusterStatusIndicator cluster={cluster} />
            </ValueWithLabel>
            <ValueWithLabel label="computeFleetStatus">
              <ComputeFleetStatusIndicator
                status={cluster.computeFleetStatus}
              />
            </ValueWithLabel>
            <ValueWithLabel label="creationTime">
              <DateView date={cluster.creationTime} />
            </ValueWithLabel>
          </SpaceBetween>
          <SpaceBetween size="l">
            <ValueWithLabel label="lastUpdatedTime">
              <DateView date={cluster.lastUpdatedTime} />
            </ValueWithLabel>
            <ValueWithLabel label="region">{cluster.region}</ValueWithLabel>
            <ValueWithLabel label="version">{cluster.version}</ValueWithLabel>
            {headNode &&
              headNode.publicIpAddress &&
              headNode.publicIpAddress !== '' &&
              ssmEnabled && (
                <ValueWithLabel label="EC2 Instance Connect">
                  <Box margin={{right: 'xxs'}} display="inline-block">
                    <Popover
                      size="small"
                      position="top"
                      dismissButton={false}
                      triggerType="custom"
                      content={
                        <StatusIndicator type="success">
                          mSSH command copied
                        </StatusIndicator>
                      }
                    >
                      {`mssh -r ${cluster.region} ${clusterDefaultUser(
                        cluster,
                      )}@${headNode.instanceId}`}
                      <Button
                        variant="inline-icon"
                        iconName="copy"
                        ariaLabel="Copy mSSH command"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `mssh -r ${cluster.region} ${clusterDefaultUser(
                              cluster,
                            )}@${headNode.instanceId}`,
                          )
                        }}
                      >
                        copy
                      </Button>
                    </Popover>
                    <HelpTooltip>
                      This copies the command to connect to the HeadNode using{' '}
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-connect-set-up.html"
                      >
                        EC2 Instance Connect
                      </a>
                      . You will need to{' '}
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-connect-set-up.html"
                      >
                        install mSSH helper
                      </a>{' '}
                      locally before running this command.
                    </HelpTooltip>
                  </Box>
                </ValueWithLabel>
              )}
          </SpaceBetween>
        </ColumnLayout>
      </Container>
    </>
  )
}
