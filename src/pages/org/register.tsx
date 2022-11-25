import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";

import IntroLayout from "../../client/Layout/intro";
import {
  IOtpFrontendVerify,
  orgSignUpSchema,
  OSignUp,
  otpFrontendVerifySchema,
} from "@/utils/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/utils/trpc";
import { useUserContext } from "@/context/user.context";

function Register() {
  const router = useRouter();

  const data = useUserContext();

  if (data) {
    router.push("/dashboard");
  }

  const [otpEnv, setOtpEnv] = useState(false);
  const [regData, setRegData] = useState<OSignUp>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OSignUp>({
    resolver: zodResolver(orgSignUpSchema),
  });

  const {
    register: reg,
    handleSubmit: hanSubmit,
    formState: { errors: errs },
  } = useForm<IOtpFrontendVerify>({
    resolver: zodResolver(otpFrontendVerifySchema),
  });

  const mutation = trpc.auth.registerOrg.useMutation();
  const otpMutation = trpc.otp.generate.useMutation({
    onSuccess: () => setOtpEnv(true),
  });
  const otpVerifyMutation = trpc.otp.verify.useMutation();

  const onOTP = useCallback(
    async (data: IOtpFrontendVerify) => {
      if (regData !== undefined) {
        const res = await otpVerifyMutation.mutateAsync({
          email: regData?.email,
          otp: data.otp,
        });
        if (res) {
          regData.otp = data.otp;
          mutation.mutate(regData);
          await router.push("/org/login");
        }
      }
    },
    [otpVerifyMutation, mutation, router, regData]
  );

  const onSubmit = useCallback(
    async (data: OSignUp) => {
      otpMutation.mutate({ email: data.email });
      setRegData(data);
    },
    [otpMutation]
  );

  return (
    <IntroLayout title="Organisation Registration">
      <h1 className="text-2xl font-semibold">Register Organisation</h1>
      {/* Account Registration Form */}
      {!otpEnv ? (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex flex-col gap-2 text-sm">
            Organisation Name:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="text"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Description:
            <textarea
              className="rounded-lg py-2 px-2 text-black"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description?.message}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Set Admin Email:
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
            Set Password:
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
            disabled={mutation.isLoading}
            type="submit"
          >
            Register
          </button>
          {mutation.error && (
            <p>Something went wrong! {mutation.error.message}</p>
          )}
          <Link href="/org/login">
            <span className="cursor-pointer text-center text-sm text-gray-500">
              Already Registered?
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
            Register
          </button>
          {otpMutation.error && (
            <p>Something went wrong! {otpMutation.error.message}</p>
          )}
          <Link href="/org/login">
            <span className="cursor-pointer text-center text-sm text-gray-500">
              Already Registered?
            </span>
          </Link>
        </form>
      )}
    </IntroLayout>
  );
}

export default Register;
