import Link from "next/link";
import { NextPage } from "next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";

import IntroLayout from "../../client/Layout/intro";
import {
  IOtpFrontendVerify,
  ISignUp,
  ITPSignUp,
  otpFrontendVerifySchema,
  signUpSchema,
} from "@/utils/validation/auth";
import { trpc } from "@/utils/trpc";
import { useUserContext } from "@/context/user.context";

const Register: NextPage = () => {
  const router = useRouter();

  const data = useUserContext();

  if (data) {
    router.push("/dashboard");
  }

  const [otpEnv, setOtpEnv] = useState(false);
  const [regData, setRegData] = useState<ITPSignUp>();
  const [loggingErrors, setLoggingErrors] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ISignUp>({
    resolver: zodResolver(signUpSchema),
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
  const otpVerify = trpc.otp.verify.useMutation();
  const regUserMutation = trpc.auth.registerUser.useMutation({
    onSuccess: () => router.push("/account/login"),
  });

  const onOTP = useCallback(
    async (data: IOtpFrontendVerify) => {
      if (regData !== undefined) {
        otpVerify.mutate({ email: regData?.email, otp: data.otp });
        regData.otp = data.otp;
        regUserMutation.mutate(regData);
      }
    },
    [otpVerify, regData, regUserMutation]
  );

  const onSubmit = useCallback(
    async (data: ISignUp) => {
      otpMutation.mutate({ email: data.email });
      const newdata: ITPSignUp = { ...data, otp: "123456" };
      setRegData(newdata);
    },
    [otpMutation]
  );

  return (
    <IntroLayout title="User Registration">
      <h1 className="text-2xl font-semibold">Register Account</h1>
      {/* Account Registration Form */}
      {!otpEnv ? (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex flex-col gap-2 text-sm">
            First Name:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="text"
              {...register("fname")}
            />
            {errors.fname && (
              <p className="text-xs text-red-500">{errors.fname?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Last Name:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="text"
              {...register("lname")}
            />
            {errors.lname && (
              <p className="text-xs text-red-500">{errors.lname?.message}</p>
            )}
          </label>
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
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            disabled={otpMutation.isLoading}
            type="submit"
          >
            Register
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
          <Link href="/account/login">
            <span className="cursor-pointer text-center text-sm text-gray-500">
              Already have an account?
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
            disabled={regUserMutation.isLoading}
            type="submit"
          >
            Submit OTP
          </button>
          {regUserMutation.error && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {regUserMutation.error.message}
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
      )}
    </IntroLayout>
  );
};

export default Register;
