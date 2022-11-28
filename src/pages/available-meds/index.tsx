import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import {
  AddAvailMedicine,
  addToAvailableMeds,
  updateAvailableMeds,
  UpdateAvailMedicine,
} from "@/utils/validation/pharm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

const AvailableMeds = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  const [apiErrors, setApiErrors] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddAvailMedicine>({
    resolver: zodResolver(addToAvailableMeds),
  });

  const {
    register: reg,
    handleSubmit: hanSubmit,
    formState: { errors: errs },
  } = useForm<UpdateAvailMedicine>({
    resolver: zodResolver(updateAvailableMeds),
  });

  const addAvailableMedsMutation = trpc.admin.addToAvailableMeds.useMutation({
    onError: (err) => {
      setApiErrors(err.message);
    },
  });

  const updateAvailableMedsMutation = trpc.admin.updateAvailableMed.useMutation(
    {
      onError: (err) => {
        setApiErrors(err.message);
      },
    }
  );

  const onSubmit = useCallback(
    async (data: AddAvailMedicine) => {
      addAvailableMedsMutation.mutate(data);
    },
    [addAvailableMedsMutation]
  );

  const onUpdate = useCallback(
    async (data: UpdateAvailMedicine) => {
      updateAvailableMedsMutation.mutate(data);
    },
    [updateAvailableMedsMutation]
  );

  if (ctxUser === null) {
    router.push("/");
    return <></>;
  }

  if (!ctxUser.verified) {
    if (ctxUser.type === "INDIVIDUAL") {
      router.push("/account/verify");
    } else if (
      ctxUser.type === "ORGANIZATION" ||
      ctxUser.type === "ORGANISATION"
    ) {
      router.push("/org/verify");
    }
  }

  if (ctxUser.type !== "ADMIN") {
    router.push("/dashboard");
    return <></>;
  }

  const { data: availableMeds } = trpc.admin.getAvailableMeds.useQuery();

  return (
    <Layout title="Manage Meds">
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
        <h1 className="my-10 text-3xl font-medium">Available Meds</h1>
        {apiErrors && <p className="text-xs text-red-500">{apiErrors}</p>}
        {/* Add new Medicine */}
        <form
          className="flex justify-between gap-6 rounded-lg border-2 border-indigo-800 p-4 px-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <label className="flex flex-col gap-2 text-sm">
            Medicine Name:
            <input
              type={"text"}
              className="rounded-lg py-2 px-2 text-black"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Image Link:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="type"
              {...register("image")}
            />
            {errors.image && (
              <p className="text-xs text-red-500">{errors.image?.message}</p>
            )}
          </label>
          <button
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            type="submit"
          >
            Add New Medicine
          </button>
        </form>
        {/* Update Medicine */}
        <form
          className="flex justify-between gap-6 rounded-lg border-2 border-indigo-800 p-4 px-8"
          onSubmit={hanSubmit(onUpdate)}
        >
          <label className="flex flex-col gap-2 text-sm">
            Medicine Id:
            <select className="rounded-lg py-2 px-2 text-black" {...reg("id")}>
              {availableMeds?.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name}
                </option>
              ))}
            </select>
            {errs.id && (
              <p className="text-xs text-red-500">{errs.id?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Name:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="text"
              {...reg("name")}
            />
            {errs.name && (
              <p className="text-xs text-red-500">{errs.name?.message}</p>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Image Link:
            <input
              className="rounded-lg py-2 px-2 text-black"
              type="text"
              {...reg("image")}
            />
            {errs.image && (
              <p className="text-xs text-red-500">{errs.image?.message}</p>
            )}
          </label>
          <button
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            type="submit"
          >
            Update
          </button>
        </form>

        <div className="flex flex-col gap-8">
          {availableMeds?.map((med) => (
            <div
              key={med.id}
              className="flex gap-10 rounded-xl border-2 border-gray-200 bg-white/10 p-4"
            >
              <img src={med.image} alt={med.name} className="h-40" />
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-medium">{med.name}</h1>
                <p className="text-sm opacity-50">#{med.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AvailableMeds;
