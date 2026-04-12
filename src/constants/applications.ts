export const applicationStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待查看', color: 'tag-gray' },
  viewed: { label: '已查看', color: 'tag-info' },
  interview: { label: '面试中', color: 'tag-warning' },
  offer: { label: '已发 Offer', color: 'tag-success' },
  rejected: { label: '不合适', color: 'tag-danger' },
  withdrawn: { label: '已撤回', color: 'tag-gray' },
}
