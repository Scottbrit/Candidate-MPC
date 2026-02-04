export type UserRole = 'admin' | 'candidate';

export type TokenPayload = {
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  user_metadata: {
    role: UserRole;
    sub: string;
  };
  role: string;
};

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
}; 