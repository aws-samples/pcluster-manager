import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group'
import {BreadcrumbGroupProps} from '@cloudscape-design/components/breadcrumb-group/interfaces'
import {CancelableEventHandler} from '@cloudscape-design/components/internal/events'

type Page = 'clusters' | 'custom-images' | 'official-images' | 'users'

const pageBreadcrumbItems: Record<Page, BreadcrumbGroupProps.Item> = {
  clusters: {text: 'Clusters', href: '#clusters'},
  'custom-images': {text: 'Custom Images', href: '#custom-images'},
  'official-images': {text: 'Official Images', href: '#official-images'},
  users: {text: 'Users', href: '#users'},
}

export function breadcrumbItemFromSlug(slug: Page): BreadcrumbGroupProps.Item {
  return pageBreadcrumbItems[slug]
}

export function breadcrumbItem(text: string): BreadcrumbGroupProps.Item {
  return {text, href: '#'}
}

const mainBreadcrumItem = {text: 'ParallelCluster Manager', href: '/clusters'}

export function Breadcrumbs({
  pages,
  onClick,
}: {
  pages: BreadcrumbGroupProps.Item[]
  onClick?: any
}) {
  const items = [mainBreadcrumItem, ...pages]

  return (
    <BreadcrumbGroup
      items={items}
      ariaLabel="ParallelCluster Manager"
      onClick={onClick}
    />
  )
}
