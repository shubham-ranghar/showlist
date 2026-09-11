export type Idea = {
  id: string
  title: string
  body: string
  authorId: string
  authorEmail: string
  voteCount: number
  optimistic?: boolean
}
