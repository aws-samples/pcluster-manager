import {useEffect, useState} from 'react'
import {DescribeCluster} from '../model'

export const useClusterPoll = (clusterName: string, startOnRender: boolean) => {
  const [start, setStart] = useState(startOnRender)

  useEffect(() => {
    if (!start) return
    const timerId = setInterval(
      () => clusterName && DescribeCluster(clusterName),
      5000,
    )
    return () => clearInterval(timerId)
  }, [start, clusterName])

  return {
    start: () => setStart(true),
    stop: () => setStart(false),
  }
}
