import handler from '@/pages/api/usage'
import { testApiHandler } from 'next-test-api-route-handler'

// Use your own preferred test structure, this test is
// just here to give a helping hand figuring out plumbing
// rather than an endorsement or guideline on testing style
describe('/api/usage', () => {
  it('returns 200 OK', async () => {
    await testApiHandler({
      pagesHandler: handler,
      test: async ({ fetch }) => expect((await fetch()).status).toBe(200),
    })
  })
})
