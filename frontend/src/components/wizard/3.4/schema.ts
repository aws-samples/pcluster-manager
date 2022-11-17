import {z} from 'zod'

export const pclusterSchema = z.object({
  SlurmSettings: z.object({
    Database: z
      .object({
        Uri: z.string().optional(),
        PasswordSecretArn: z.string().optional(),
        UserName: z.string().optional(),
      })
      .refine(
        ({Uri, PasswordSecretArn, UserName}) => {
          if (!Uri && !PasswordSecretArn && !UserName) {
            return true
          }
          return Uri && PasswordSecretArn && UserName
        },
        {
          message: 'All accounting fields must be filled',
        },
      )
      .optional(),
  }),
  DCV: z
    .object({
      EnabledV2: z.boolean().optional(),
    })
    .optional(),
  LoginNodes: z
    .object({
      Arn: z.string().min(1),
    })
    .optional(),
})

export type PClusterConfig = z.infer<typeof pclusterSchema>
