export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthCredentials {
  fullName: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}
