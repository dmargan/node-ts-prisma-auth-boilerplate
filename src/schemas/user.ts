import z from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, "Please tell us your name!"),
    email: z
      .string()
      .min(1, "Please provide your email address!")
      .email("Please provide a valid email address")
      .transform((email) => email.toLowerCase()),
    password: z.string().min(8, "A password must have more than 8 characters"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords are not the same!",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please provide your email address!")
    .email("Please provide a valid email address")
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Please provide your password!"),
});
