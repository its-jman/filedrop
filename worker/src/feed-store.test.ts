import {env, runDurableObjectAlarm, runInDurableObject, SELF} from 'cloudflare:test'
import {afterEach, beforeAll, describe, expect, it} from 'vitest'
import {FeedStore} from './feed-store'
import dayjs from 'dayjs'
import {fetchMock} from 'cloudflare:test'
import {getByName} from '@teeny.dev/durable'

const MOCKS = {
	RSS: `<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><channel><title><![CDATA[ The Cloudflare Blog ]]></title><description><![CDATA[ Get the latest news on how products at Cloudflare are built, technologies used, and join the teams helping to build a better Internet. ]]></description><link>https://blog.cloudflare.com</link><atom:link href="https://blog.cloudflare.com/" rel="self" type="application/rss+xml"/><language>en-us</language><image><url>https://blog.cloudflare.com/favicon.png</url><title>The Cloudflare Blog</title><link>https://blog.cloudflare.com</link></image><lastBuildDate>Fri, 27 Dec 2024 14:00:19 GMT</lastBuildDate><item><title><![CDATA[Sometimes I cache: implementing lock-free probabilistic caching]]></title><link>https://blog.cloudflare.com/sometimes-i-cache/</link><pubDate>Thu, 26 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ If you want to know what cache revalidation is, how it works, and why it can involve rolling a die, read on. This blog post presents a lock-free probabilistic approach to cache revalidation, along ]]></description><category><![CDATA[Research]]></category><category><![CDATA[Cache]]></category><category><![CDATA[Cloudflare Workers]]></category><category><![CDATA[Developer Platform]]></category><guid isPermaLink="false">4Xek2BRcXVKNsI4vCa3Zuj</guid><dc:creator>Thibault Meunier</dc:creator></item><item><title><![CDATA[Un experimento rápido: translating Cloudflare Stream captions with Workers AI]]></title><link>https://blog.cloudflare.com/un-experimento-rapido-translating-cloudflare-stream-captions-with-workers-ai/</link><pubDate>Tue, 24 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ How I used Workers AI to translate Cloudflare Stream’s auto-generated captions and what I learned along the way. ]]></description><category><![CDATA[Cloudflare Stream]]></category><category><![CDATA[Cloudflare Workers]]></category><category><![CDATA[Workers AI]]></category><guid isPermaLink="false">6OAfYNDjjJBccE1gFIVrnu</guid><dc:creator>Taylor Smith</dc:creator></item><item><title><![CDATA[When the world logs off: Christmas, New Year’s, and the Internet’s holiday rhythm]]></title><link>https://blog.cloudflare.com/when-the-world-logs-off-christmas-new-years-and-the-internets-holiday-rhythm/</link><pubDate>Tue, 24 Dec 2024 10:00:00 GMT</pubDate><description><![CDATA[ From Christmas Eve dinners in Europe to New Year’s Eve countdowns in Asia, Cloudflare data reveals how global festivities have typically shaped Internet usage and cultural rhythms ]]></description><category><![CDATA[Internet Traffic]]></category><category><![CDATA[Radar]]></category><category><![CDATA[Trends]]></category><category><![CDATA[Christmas]]></category><guid isPermaLink="false">5hrEiGd7frxGgAirAdHCM0</guid><dc:creator>João Tomé</dc:creator></item><item><title><![CDATA[Grinch Bots strike again: defending your holidays from cyber threats]]></title><link>https://blog.cloudflare.com/grinch-bot-2024/</link><pubDate>Mon, 23 Dec 2024 14:01:00 GMT</pubDate><description><![CDATA[ Cloudflare observed a 4x increase in bot-related traffic on Black Friday in 2024. 29% of all traffic on our network on Black Friday was Grinch Bots wreaking holiday havoc. ]]></description><category><![CDATA[AI Bots]]></category><category><![CDATA[Grinch]]></category><category><![CDATA[Bots]]></category><category><![CDATA[Bot Management]]></category><category><![CDATA[Application Security]]></category><category><![CDATA[Application Services]]></category><guid isPermaLink="false">5yiWFM9NumXY8HARoEP8x6</guid><dc:creator>Avi Jaisinghani</dc:creator><dc:creator>Adam Martinetti</dc:creator><dc:creator>Brian Mitchell</dc:creator></item><item><title><![CDATA[Global elections in 2024: Internet traffic and cyber threat trends]]></title><link>https://blog.cloudflare.com/elections-2024-internet/</link><pubDate>Mon, 23 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ In 2024, as elections took place across over 60 countries, the Internet became both a battleground for cyberattacks and a vital platform for democratic engagement. ]]></description><category><![CDATA[Radar]]></category><category><![CDATA[Elections]]></category><category><![CDATA[DDoS]]></category><category><![CDATA[Trends]]></category><category><![CDATA[Network Services]]></category><guid isPermaLink="false">20PQRE3QVidqRIeb9OYby8</guid><dc:creator>João Tomé</dc:creator></item><item><title><![CDATA[Hi Claude, build an MCP server on Cloudflare Workers]]></title><link>https://blog.cloudflare.com/model-context-protocol/</link><pubDate>Fri, 20 Dec 2024 14:50:00 GMT</pubDate><description><![CDATA[ Want Claude to interact with your app directly? Build an MCP server on Cloudflare Workers, enabling you to connect your service directly, allowing Claude to understand and run tasks on your behalf. ]]></description><category><![CDATA[MCP]]></category><category><![CDATA[AI]]></category><category><![CDATA[Cloudflare Workers]]></category><guid isPermaLink="false">aWV4m3ZRWKcTPXMFuhumH</guid><dc:creator>Dina Kozlov</dc:creator><dc:creator>Glen Maddern</dc:creator></item><item><title><![CDATA[Bring multimodal real-time interaction to your AI applications with Cloudflare Calls]]></title><link>https://blog.cloudflare.com/bring-multimodal-real-time-interaction-to-your-ai-applications-with-cloudflare-calls/</link><pubDate>Fri, 20 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ Bring ChatGPT to your next video meeting with Cloudflare Calls.  ]]></description><category><![CDATA[AI]]></category><category><![CDATA[Cloudflare Calls]]></category><category><![CDATA[WebRTC]]></category><guid isPermaLink="false">HTZlONeYfVQ79aKvAsgxI</guid><dc:creator>Will Allen</dc:creator><dc:creator>Felipe Astroza Araya</dc:creator><dc:creator>Kevin Kipp</dc:creator></item><item><title><![CDATA[The role of email security in reducing user risk amid rising threats]]></title><link>https://blog.cloudflare.com/the-role-of-email-security-in-reducing-user-risk-amid-rising-threats/</link><pubDate>Thu, 19 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ As threats evolve, SOC teams must adapt their operations. With Cloudflare’s holistic approach to managing user-based risk, SOC teams can operate more efficiently and reduce the likelihood of a breach. ]]></description><category><![CDATA[Cloud Email Security]]></category><category><![CDATA[SASE]]></category><category><![CDATA[Zero Trust]]></category><guid isPermaLink="false">4fVFiDpaCJhYAFUvAocDDC</guid><dc:creator>Ayush Kumar</dc:creator><dc:creator>Justin Knapp</dc:creator></item><item><title><![CDATA[Internationalization and localization: bringing Cloudflare Radar to a global audience]]></title><link>https://blog.cloudflare.com/cloudflare-radar-localization-journey/</link><pubDate>Mon, 16 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ Internationalization and localization require more than translation: tone, images, date/time and number formatting, among other items, need to be considered. ]]></description><category><![CDATA[Radar]]></category><category><![CDATA[JavaScript]]></category><category><![CDATA[Radar Maps]]></category><category><![CDATA[Localization]]></category><guid isPermaLink="false">6mJPdu3FUGFiIg7e0UMXr6</guid><dc:creator>Alejandro Diaz-Garcia</dc:creator><dc:creator>David Fidalgo</dc:creator><dc:creator>Nuno Pereira</dc:creator></item><item><title><![CDATA[Robotcop: enforcing your robots.txt policies and stopping bots before they reach your website]]></title><link>https://blog.cloudflare.com/ai-audit-enforcing-robots-txt/</link><pubDate>Tue, 10 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ Today, the AI Audit dashboard gets an upgrade: you can now quickly see which AI services are honoring your robots.txt policies and then automatically enforce the policies against those that aren’t.]]></description><category><![CDATA[AI]]></category><category><![CDATA[Network Services]]></category><category><![CDATA[Application Services]]></category><category><![CDATA[security.txt]]></category><guid isPermaLink="false">6Bi6mGvw8vrskNZ7Mmp73F</guid><dc:creator>Celso Martinho</dc:creator><dc:creator>Will Allen</dc:creator><dc:creator>Nelson Duarte</dc:creator></item><item><title><![CDATA[Cloudflare 2024 Year in Review]]></title><link>https://blog.cloudflare.com/radar-2024-year-in-review/</link><pubDate>Mon, 09 Dec 2024 14:05:00 GMT</pubDate><description><![CDATA[ The 2024 Cloudflare Radar Year in Review is our fifth annual review of Internet trends and patterns at both a global and country/region level. ]]></description><category><![CDATA[Year in Review]]></category><category><![CDATA[Radar]]></category><category><![CDATA[Trends]]></category><category><![CDATA[Internet Traffic]]></category><category><![CDATA[Outage]]></category><category><![CDATA[Internet Quality]]></category><category><![CDATA[Security]]></category><guid isPermaLink="false">4oLkLHLIZ1vibq8dtPJP6F</guid><dc:creator>David Belson</dc:creator></item><item><title><![CDATA[From ChatGPT to Temu: ranking top Internet services in 2024]]></title><link>https://blog.cloudflare.com/radar-2024-year-in-review-internet-services/</link><pubDate>Mon, 09 Dec 2024 14:00:00 GMT</pubDate><description><![CDATA[ The 2024 popular Internet services landscape highlights rising generative AI, e-commerce shifts, and the continued dominance of platforms like Google and Facebook, as revealed by Cloudflare’s rankings ]]></description><category><![CDATA[Year in Review]]></category><category><![CDATA[Radar]]></category><category><![CDATA[Trends]]></category><category><![CDATA[Internet Traffic]]></category><guid isPermaLink="false">1bFqI2J5pfAs7dEpRp8auV</guid><dc:creator>João Tomé</dc:creator></item><item><title><![CDATA[From deals to DDoS: exploring Cyber Week 2024 Internet trends]]></title><link>https://blog.cloudflare.com/from-deals-to-ddos-exploring-cyber-week-2024-internet-trends/</link><pubDate>Tue, 03 Dec 2024 20:43:00 GMT</pubDate><description><![CDATA[ How significant are Cyber Week shopping days on the Internet? Is it a global phenomenon? Does E-commerce interest peak on Black Friday or Cyber Monday, and are attacks increasing during this time? We try to answer these questions and more.]]></description><category><![CDATA[eCommerce]]></category><category><![CDATA[Radar]]></category><category><![CDATA[Trends]]></category><category><![CDATA[Internet Traffic]]></category><category><![CDATA[DDoS]]></category><guid isPermaLink="false">6dyAchgukCJiXildEHYa23</guid><dc:creator>João Tomé</dc:creator></item><item><title><![CDATA[Cloudflare incident on November 14, 2024, resulting in lost logs]]></title><link>https://blog.cloudflare.com/cloudflare-incident-on-november-14-2024-resulting-in-lost-logs/</link><pubDate>Tue, 26 Nov 2024 16:00:00 GMT</pubDate><description><![CDATA[ On November 14, 2024, Cloudflare experienced a Cloudflare Logs outage, impacting the majority of customers using these products. During the ~3.5 hours that these services were impacted, about 55% of the logs we normally send to customers were not sent and were lost. The details of what went wrong and why are interesting both for customers and practitioners. ]]></description><category><![CDATA[Logs]]></category><category><![CDATA[Data]]></category><category><![CDATA[Log Push]]></category><guid isPermaLink="false">3SNSdDbbVziSrdGxDq4AzH</guid><dc:creator>Jamie Herre</dc:creator><dc:creator>Tom Walwyn</dc:creator><dc:creator>Christian Endres</dc:creator><dc:creator>Gabriele Viglianisi</dc:creator><dc:creator>Mik Kocikowski</dc:creator><dc:creator>Rian van der Merwe</dc:creator></item><item><title><![CDATA[Bigger and badder: how DDoS attack sizes have evolved over the last decade]]></title><link>https://blog.cloudflare.com/bigger-and-badder-how-ddos-attack-sizes-have-evolved-over-the-last-decade/</link><pubDate>Wed, 20 Nov 2024 22:00:00 GMT</pubDate><description><![CDATA[ If we plot the metrics associated with large DDoS attacks observed in the last 10 years, does it show a straight, steady increase in an exponential curve that keeps becoming steeper, or is it closer to a linear growth? Our analysis found the growth is not linear but rather is exponential, with the slope varying depending on the metric (rps, pps or bps).  ]]></description><category><![CDATA[DDoS]]></category><category><![CDATA[Attacks]]></category><category><![CDATA[Trends]]></category><guid isPermaLink="false">5JhHzAWP0tvrl8ZolsnvyE</guid><dc:creator>José Salvador</dc:creator></item><item><title><![CDATA[Resilient Internet connectivity in Europe mitigates impact from multiple cable cuts]]></title><link>https://blog.cloudflare.com/resilient-internet-connectivity-baltic-cable-cuts/</link><pubDate>Wed, 20 Nov 2024 21:30:00 GMT</pubDate><description><![CDATA[ Two recent cable cuts that occurred in the Baltic Sea resulted in little-to-no observable impact to the affected countries, in large part because of the significant redundancy and resilience of Internet infrastructure in Europe.]]></description><category><![CDATA[Radar]]></category><category><![CDATA[Internet Traffic]]></category><category><![CDATA[Traffic]]></category><category><![CDATA[Outage]]></category><guid isPermaLink="false">5DP2F9GATeUBYyfl6pQMej</guid><dc:creator>David Belson</dc:creator></item><item><title><![CDATA[DO it again: how we used Durable Objects to add WebSockets support and authentication to AI Gateway]]></title><link>https://blog.cloudflare.com/do-it-again/</link><pubDate>Tue, 19 Nov 2024 22:00:00 GMT</pubDate><description><![CDATA[ We used Cloudflare’s Developer Platform and Durable Objects to build authentication and a WebSockets API that developers can use to call AI Gateway, enabling continuous communication over a single ]]></description><category><![CDATA[AI]]></category><category><![CDATA[AI Gateway]]></category><category><![CDATA[Developers]]></category><category><![CDATA[Developer Platform]]></category><category><![CDATA[JavaScript]]></category><guid isPermaLink="false">2b8uznXSknoVGwTIcxxmKp</guid><dc:creator>Catarina Pires Mota</dc:creator><dc:creator>Gabriel Massadas</dc:creator></item><item><title><![CDATA[What’s new in Cloudflare: Account Owned Tokens and Zaraz Automated Actions]]></title><link>https://blog.cloudflare.com/account-owned-tokens-automated-actions-zaraz/</link><pubDate>Thu, 14 Nov 2024 14:00:00 GMT</pubDate><description><![CDATA[ Cloudflare customers can now create Account Owned Tokens , allowing more flexibility around access control for their Cloudflare services. Additionally, Zaraz Automation Actions streamlines event tracking and third-party tool integration.  ]]></description><category><![CDATA[Identity]]></category><category><![CDATA[Security]]></category><category><![CDATA[Developers]]></category><category><![CDATA[Product News]]></category><category><![CDATA[Zaraz]]></category><category><![CDATA[Analytics]]></category><category><![CDATA[Managed Components]]></category><guid isPermaLink="false">5BHU4q5GpzBQ1OLQoUvkKN</guid><dc:creator>Joseph So</dc:creator><dc:creator>Omar Mohammad</dc:creator><dc:creator>Yo\'av Moshe</dc:creator></item><item><title><![CDATA[How we prevent conflicts in authoritative DNS configuration using formal verification]]></title><link>https://blog.cloudflare.com/topaz-policy-engine-design/</link><pubDate>Fri, 08 Nov 2024 14:00:00 GMT</pubDate><description><![CDATA[ We describe how Cloudflare uses a custom Lisp-like programming language and formal verifier (written in Racket and Rosette) to prevent logical contradictions in our authoritative DNS nameserver’s behavior. ]]></description><category><![CDATA[DNS]]></category><category><![CDATA[Research]]></category><category><![CDATA[Addressing]]></category><category><![CDATA[Formal Methods]]></category><guid isPermaLink="false">5LVsblxj2Git54IRxadpyg</guid><dc:creator>James Larisch</dc:creator><dc:creator>Suleman Ahmad</dc:creator><dc:creator>Marwan Fayed</dc:creator></item><item><title><![CDATA[A look at the latest post-quantum signature standardization candidates]]></title><link>https://blog.cloudflare.com/another-look-at-pq-signatures/</link><pubDate>Thu, 07 Nov 2024 14:00:00 GMT</pubDate><description><![CDATA[ NIST has standardized four post-quantum signature schemes so far, and they’re not done yet: there are fourteen new candidates in the running for standardization. In this blog post we take measure of them and discover why we ended up with so many PQ signatures. ]]></description><category><![CDATA[Post-Quantum]]></category><category><![CDATA[Research]]></category><category><![CDATA[Cryptography]]></category><category><![CDATA[TLS]]></category><guid isPermaLink="false">3mOPXbiTgeQHBChx4vUuMs</guid><dc:creator>Bas Westerbaan</dc:creator><dc:creator>Luke Valenta</dc:creator></item></channel>\n</rss>`,
}

/**
 * FeedStore
 * 	Signup for new feed - Create FeedStore for that feed
 * 	Fetch / initalize feed - populating initial items
 * 		await stub.initalize() -> (fetches feed, returns initial items)
 * 			setMeta()
 * 			refreshFeed()
 * 				_fetchFeed()
 * 				for item of feed
 * 					handleInsertUpdate(item)
 * 						getId(item) -> item.id ?? item.link ** ?? item.title ** ?? null
 * 							(don't insert if you don't have an id)
 * 						if stored !== item
 * 							update all fields
 *
 *
 *  Start cron to refetch every 'n' hours
 * 		In initalize, handler calls refreshFeed
 * 			_fetchFeed()
 * 			for item of feed
 * 				handleInsertUpdate(item) ...
 *
 *
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
 *
 *
 * if getId() in .get(`...${getId()}`), structural compare / zod simplify and update.
 *
 */

describe('FeedStorage', () => {
	beforeAll(() => {
		// Enable outbound request mocking...
		fetchMock.activate()
		// ...and throw errors if an outbound request isn't mocked
		fetchMock.disableNetConnect()
	})
	// Ensure we matched every mock we defined
	afterEach(() => fetchMock.assertNoPendingInterceptors())

	it('initalizes, with valid list, getMeta', async () => {
		fetchMock
			.get('https://blog.cloudflare.com')
			.intercept({path: '/rss'})
			.reply(200, MOCKS.RSS)

		const stub = getByName(env.FEED_STORE, 'main')
		const items = await stub.initalize({feed_url: 'https://blog.cloudflare.com/rss'})

		await runInDurableObject(stub, async (inst) => {
			await inst.alarm.cancel(inst.getMeta().alarm_id)
		})

		expect(items).toHaveLength(20)
		expect(await runDurableObjectAlarm(stub)).eq(true)
		expect(await runDurableObjectAlarm(stub)).eq(false)
	})
	it('initalizes, with invalid list, getMeta', async () => {})

	it('errors if not initalized', async () => {})
	it('errors initalization if already initalized', async () => {})

	it('getItem, existing + missing items', async () => {})

	it('handleInsertUpdate, stored and new', async () => {})

	it("lists items, doesn't overwhelm with thousands of entries (paginate)", async () => {})
	it('lists items', async () => {
		const stub = env.FEED_STORE.get(env.FEED_STORE.idFromName('main'))
		await stub.handleInsertUpdateItem({
			id: '1',
			link: 'https://google.com/blog',
			title: 'List items 3 days ago',
			pub_date: dayjs().subtract(3, 'd').toDate(),
		})
		await stub.handleInsertUpdateItem({
			id: '2',
			link: 'https://google.com/blog',
			title: 'List items 7 days ago',
			pub_date: dayjs().subtract(7, 'd').toDate(),
		})
		await stub.handleInsertUpdateItem({
			id: '3',
			link: 'https://google.com/blog',
			title: 'List items 5 days ago',
			pub_date: dayjs().subtract(5, 'd').toDate(),
		})

		// Items should be ordered oldest to newest
		const list = await stub.listItems({startAfter: dayjs().subtract(6, 'd').toDate()})
		expect(list).toHaveLength(2)
		expect(list[0]?.title).toEqual('List items 5 days ago')
		expect(list[1]?.title).toEqual('List items 3 days ago')

		const list2 = await stub.listItems({startAfter: dayjs().subtract(1, 'd').toDate()})
		expect(list2).toHaveLength(0)

		await stub.handleInsertUpdateItem({
			id: '1',
			link: 'https://google.com/blog',
			title: 'List items 9 days ago',
			pub_date: dayjs().subtract(9, 'd').toDate(),
		})

		const list3 = await stub.listItems()
		expect(list3).toHaveLength(3)
		expect(list3[0]?.title).toEqual('List items 9 days ago')
	})
})
