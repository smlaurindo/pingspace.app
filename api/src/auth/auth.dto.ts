export type SignInHttpRequest = {
  email: string;
  password: string;
};

export type SignUpRequest = {
  email: string;
  password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignUpResponse = {
  accessToken: string;
};

export type SignInResponse = {
  accessToken: string;
};
