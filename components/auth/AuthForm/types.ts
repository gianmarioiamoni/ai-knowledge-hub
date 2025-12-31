type AuthFormState = {
  error?: string;
  success?: string;
};

type Mode = "signin" | "signup";

type AuthAction = (
  prevState: AuthFormState,
  formData: FormData
) => Promise<AuthFormState>;

type BoundAuthAction = (formData: FormData) => void | Promise<void>;

type ProviderAction = () => Promise<void>;

export type { AuthAction, AuthFormState, BoundAuthAction, Mode, ProviderAction };

