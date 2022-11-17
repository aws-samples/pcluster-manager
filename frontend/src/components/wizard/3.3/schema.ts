import { z } from "zod";

export const pclusterSchema = z.object({
  SlurmSettings: z.object({
    Database: z.object({
      Uri: z.string().optional(),
      PasswordSecretArn: z.string().optional(),
      UserName: z.string().optional(),
    }).refine(({ Uri, PasswordSecretArn, UserName }) => {
      if (!Uri && !PasswordSecretArn && !UserName) {
        return true;
      }
      return Uri && PasswordSecretArn && UserName;
    }, {
      message: "All accounting fields must be filled"
    }).optional(),
  }),
  DCV: z.object({
    Enabled: z.boolean().optional(),
  }).optional()
});

export type PClusterConfig = z.infer<typeof pclusterSchema>;