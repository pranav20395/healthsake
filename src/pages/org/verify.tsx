import { NextPage } from "next";
import { useRouter } from "next/router";

import IntroLayout from "../../client/Layout/intro";
import { trpc } from "@/utils/trpc";
import { OrgVerifySchema, orgVerifySchema } from "@/utils/validation/verify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback } from "react";
import { useUserContext } from "@/context/user.context";
import axios from "axios";

const Register: NextPage = () => {
  const router = useRouter();

  const userCtx = useUserContext();

  if (!userCtx || userCtx === null) {
    router.push("/");
  }

  const { data, isLoading, error } = trpc.authedUsers.basicDetails.useQuery();

  if (
    data &&
    data.result.type !== "ORGANIZATION" &&
    data.result.type !== "ORGANISATION"
  ) {
    router.push("/");
  }

  if (
    userCtx.verified &&
    data &&
    data.result.userVerified &&
    data.result.status === "APPROVED"
  ) {
    router.push("/dashboard");
  }

  const didSubmit = data?.result.status !== "CREATED";

  const logout = trpc.authedUsers.logout.useMutation({
    onSuccess: () => {
      router.reload();
      router.push("/");
    },
  });

  const toLogout = useCallback(() => {
    logout.mutateAsync();
  }, [logout]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrgVerifySchema>({
    resolver: zodResolver(orgVerifySchema),
  });

  const uploadFile = async (formData: FormData) => {
    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };

    const response = await axios.post("/api/uploads", formData, config);

    console.log("response", response.data);
    return response.data;
  };

  const orgVerify = trpc.verify.orgSubmitForVerification.useMutation({
    onSuccess: () => router.reload(),
  });

  const onSubmit = useCallback(
    async (data: OrgVerifySchema) => {
      let formData = new FormData();
      formData.append("file", data.image1[0]);
      const imgUrl1 = await uploadFile(formData);
      formData = new FormData();
      formData.append("file", data.image2[0]);
      const imgUrl2 = await uploadFile(formData);
      formData = new FormData();
      formData.append("file", data.location[0]);
      const locUrl = await uploadFile(formData);
      formData = new FormData();
      formData.append("file", data.license[0]);
      const licenseUrl = await uploadFile(formData);
      formData = new FormData();
      formData.append("file", data.permit[0]);
      const permitUrl = await uploadFile(formData);

      const urlData = {
        image1: imgUrl1,
        image2: imgUrl2,
        address: locUrl,
        license: licenseUrl,
        permit: permitUrl,
        phone: data.phone,
      };

      console.log(urlData);
      // await uploadFile(formData);

      orgVerify.mutate({
        role: data.role,
        ...urlData,
      });
    },
    [orgVerify]
  );

  return (
    <IntroLayout title="User Registration">
      <h1 className="text-2xl font-semibold">Verification</h1>
      {/* Account Registration Form */}
      {!didSubmit ? (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex flex-col gap-2 text-sm">
            Register as:
            <select
              className="rounded-lg py-2 px-2 text-black"
              {...register("role")}
            >
              <option value="HOSPITAL">Hospital</option>
              <option value="PHARMACY">Pharmacy</option>
              <option value="INSURANCE">Insurance Company</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-500">{errors.role?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Upload Image 1:
            <input
              className="rounded-lg py-2 px-2 text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              type="file"
              {...register("image1")}
            />
            {errors.image1 && (
              <p className="text-xs text-red-500">
                {JSON.stringify(errors.image1.message)}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Upload Image 2:
            <input
              className="rounded-lg py-2 px-2 text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              type="file"
              {...register("image2")}
            />
            {errors.image2 && (
              <p className="text-xs text-red-500">
                {JSON.stringify(errors.image2.message)}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Upload License:
            <input
              className="rounded-lg py-2 px-2 text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              type="file"
              {...register("license")}
            />
            {errors.license && (
              <p className="text-xs text-red-500">
                {JSON.stringify(errors.license.message)}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Upload Permit:
            <input
              className="rounded-lg py-2 px-2 text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              type="file"
              {...register("permit")}
            />
            {errors.permit && (
              <p className="text-xs text-red-500">
                {JSON.stringify(errors.permit.message)}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Upload Address Proof:
            <input
              className="rounded-lg py-2 px-2 text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:py-2 file:px-4 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              type="file"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-xs text-red-500">
                {JSON.stringify(errors.location.message)}
              </p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Enter Phone Number:
            <input
              className={"rounded-lg py-2 px-2 text-black"}
              type={"number"}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </label>

          <button
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            type="submit"
          >
            Submit for Verification
          </button>
        </form>
      ) : (
        <h2>
          {data?.result.userVerified &&
            data?.result.status === "APPROVED" &&
            "Admin has approved your application 🎉. Pls logout and login again!!"}
          {data?.result.status === "REJECTED" &&
            "🛑 Your application has been rejected/ You got banned from the site. Please contact admin for more details"}
          {data?.result.status === "PENDING" &&
            "Waiting for Admin to approve..."}
        </h2>
      )}
      <button
        className="rounded-xl bg-indigo-600 p-3 px-8 text-sm transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
        onClick={() => toLogout()}
      >
        Logout
      </button>
    </IntroLayout>
  );
};

export default Register;
