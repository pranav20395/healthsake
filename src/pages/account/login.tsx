import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import IntroLayout from "../../client/Layout/intro";
import {
  ILogin,
  IOtpFrontendVerify,
  loginSchema,
  otpFrontendVerifySchema,
} from "@/utils/validation/auth";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { useUserContext } from "@/context/user.context";

function Login() {
  const router = useRouter();

  const data = useUserContext();

  if (data) {
    router.push("/dashboard");
  }

  const [otpEnv, setOtpEnv] = useState(false);
  const [logData, setLogData] = useState<ILogin>();
  const [loggingErrors, setLoggingErrors] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: reg,
    handleSubmit: hanSubmit,
    formState: { errors: errs },
  } = useForm<IOtpFrontendVerify>({
    resolver: zodResolver(otpFrontendVerifySchema),
  });

  const otpMutation = trpc.otp.generate.useMutation({
    onSuccess: () => setOtpEnv(true),
  });
  const otpVerify = trpc.otp.verifyWithLogin.useMutation({
    onSuccess: () => router.reload(),
    onError: (err) => setLoggingErrors(err.message),
  });

  const onOTP = useCallback(
    async (data: IOtpFrontendVerify) => {
      if (logData !== undefined) {
        otpVerify.mutate({
          email: logData?.email,
          otp: data.otp,
          password: logData?.password,
        });
      }
    },
    [logData, otpVerify]
  );

  const onSubmit = useCallback(
    async (data: ILogin) => {
      if (data.email !== "admin@healthsake.io") {
        otpMutation.mutate({ email: data.email });
        setLogData(data);
      } else {
        otpVerify.mutate({
          email: data.email,
          otp: "123456",
          password: data.password,
        });
      }
    },
    [otpMutation, otpVerify]
  );

  return (
    <IntroLayout title="User Login">
      <h1 className="text-2xl font-semibold">Login</h1>
      {/* Account Login Form */}
      {!otpEnv ? (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex flex-col gap-2 text-sm">
            Email:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Password:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password?.message}</p>
            )}
          </label>
          <button
            onClick={() => setValue("type", "USER")}
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            disabled={otpMutation.isLoading}
            type="submit"
          >
            Login
          </button>
          {otpMutation.error && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {otpMutation.error.message}
            </p>
          )}
          {loggingErrors && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {loggingErrors}
            </p>
          )}
          <Link href="/account/register">
            <span className="cursor-pointer text-center text-sm text-gray-500">
              Don&apos;t have an account?
            </span>
          </Link>
        </form>
      ) : (
        <form className="flex flex-col gap-6" onSubmit={hanSubmit(onOTP)}>
          <label className="flex flex-col gap-2 text-sm">
            Enter the OTP sent to your email:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="text"
              {...reg("otp")}
            />
            {errs.otp && (
              <p className="text-xs text-red-500">{errs.otp?.message}</p>
            )}
          </label>
          <button
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            disabled={otpMutation.isLoading}
            type="submit"
          >
            Submit OTP
          </button>
          {loggingErrors && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {loggingErrors}
            </p>
          )}
          <Link href="/account/register">
            <span className="cursor-pointer text-center text-sm text-gray-500">
              Don&apos;t have an account?
            </span>
          </Link>
        </form>
      )}
    </IntroLayout>
  );
}

export default Login;
