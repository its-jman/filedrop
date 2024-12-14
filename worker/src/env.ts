import {z} from 'zod'

export const EnvSchema = z.object({})
export type Env = z.infer<typeof EnvSchema>
