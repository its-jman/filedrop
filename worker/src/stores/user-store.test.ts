import {describe, it} from 'vitest'

/**
 * User cron, create digest every 'n' days
 *		Each user has a DO?
 * 		One overarching DO?
 * 		One for each iteration? List all digests with frequency === Monday 6pm - weekly -> Send to queue -> worker fetches new items from each item listed -> builds digest
 *
 * 	How does digest cron work?
 * 		every daily / time
 * 		every week at the same day / time
 * 		every month day / time
 * 	Consuming this data:
 * 		Daily / weekly are easy, lookup everything with this day (* || curr day) / time.
 * 		What about weekday only?
 * 		How should monthly work?
 *
 * 		Should this be regular cron scheduling?
 * 		What if each digest just has their own alarms?
 *
 *
 * User logs in (stored in d1? do? Lets just do a one-off Duro? Or go through setting up d1 to get the experience... )
 *    Lets do that. Setup d1 to get the experience.
 *
 * User subscribes to feed - stored in Duro
 *
 */
describe('user store', () => {
	it('', async (ctx) => {})
})
