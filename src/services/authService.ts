import { AuthCredentials, AuthUser, RegisterInput } from "../types/auth.types";
import { isRequired, isStrongPassword, isValidEmail } from "../utils/validators";

type StoredUser = AuthUser & {
  password: string;
};

let users: StoredUser[] = [
  {
    id: "demo-user",
    fullName: "Demo User",
    email: "demo@finance.app",
    password: "Password123",
  },
];

const buildUser = (data: Pick<AuthUser, "fullName" | "email">): AuthUser => ({
  id: `user-${Date.now()}`,
  fullName: data.fullName,
  email: data.email,
});

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthUser> {
    if (!isValidEmail(credentials.email)) {
      throw new Error("Enter a valid email address.");
    }

    if (!isStrongPassword(credentials.password)) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const user = users.find(
      (item) => item.email.toLowerCase() === credentials.email.toLowerCase() && item.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    if (!isRequired(input.fullName)) {
      throw new Error("Full name is required.");
    }

    if (!isValidEmail(input.email)) {
      throw new Error("Enter a valid email address.");
    }

    if (!isStrongPassword(input.password)) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const alreadyExists = users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());

    if (alreadyExists) {
      throw new Error("An account with that email already exists.");
    }

    const nextUser = {
      ...buildUser({ fullName: input.fullName, email: input.email }),
      password: input.password,
    };

    users = [...users, nextUser];

    return {
      id: nextUser.id,
      fullName: nextUser.fullName,
      email: nextUser.email,
    };
  },

  async logout() {
    return true;
  },
};
