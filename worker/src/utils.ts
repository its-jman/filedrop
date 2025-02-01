export class DigesterError extends Error {
	detail: string
	constructor(message: string, options: ErrorOptions & {detail: string}) {
		super(message, options)
		this.detail = options.detail
	}
}
