import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { PrescribeMedicine, prescribeMedicine } from "@/utils/validation/pharm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

const PrescribePage = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  const [med, setMed] = useState<PrescribeMedicine[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrescribeMedicine>({
    resolver: zodResolver(prescribeMedicine),
  });

  const onSubmit = useCallback(async (data: PrescribeMedicine) => {
    setMed((prev) => [...prev, data]);
  }, []);

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { consultationId } = router.query;

  if (!consultationId) {
    return <p>Loading..</p>;
  }

  const { data: consultation } = trpc.patient.getConsultationDetails.useQuery({
    consultationId: consultationId as string,
  });

  const { data: availableMeds } = trpc.admin.getAvailableMeds.useQuery();

  const pmeds = trpc.patient.prescribeMedicine.useMutation();

  if (consultation?.status === "DONE") {
    router.push("/prescriptions");
    return <></>;
  }

  return (
    <Layout title="Prescribe">
      <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
        <h1 className="my-10 text-3xl font-medium">Prescribe</h1>
        <form
          className="mx-auto flex w-5/6 justify-between gap-6 rounded-lg border-2 border-indigo-800 p-4 px-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Medicine Name:
              {availableMeds && (
                <select
                  className="rounded-lg py-2 px-2 text-black"
                  {...register("availableMedsId")}
                >
                  <>
                    {availableMeds.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name}
                      </option>
                    ))}
                  </>
                </select>
              )}
              {errors.availableMedsId && (
                <p className="text-xs text-red-500">
                  {errors.availableMedsId?.message}
                </p>
              )}
            </label>
            <div className="flex gap-4">
              <label className="flex flex-col gap-2 text-sm">
                Frequency:
                <input
                  className="rounded-lg py-2 px-2 text-black"
                  type="text"
                  {...register("frequency")}
                />
                {errors.frequency && (
                  <p className="text-xs text-red-500">
                    {errors.frequency?.message}
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-2 text-sm">
                Strength:
                <input
                  className="rounded-lg py-2 px-2 text-black"
                  type="number"
                  {...register("strength")}
                />
                {errors.strength && (
                  <p className="text-xs text-red-500">
                    {errors.strength?.message}
                  </p>
                )}
              </label>
              <label className="flex flex-col gap-2 text-sm">
                Quantity:
                <input
                  className="rounded-lg py-2 px-2 text-black"
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-xs text-red-500">
                    {errors.quantity?.message}
                  </p>
                )}
              </label>
            </div>
          </div>
          <button
            className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
            type="submit"
          >
            Add New Medicine
          </button>
        </form>
        {consultation && (
          <div className="mx-auto flex w-5/6 flex-col gap-4 rounded-md border-2 border-white p-8">
            <div className="flex justify-between">
              <div className="my-2 flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">
                  Dr.{consultation.doctor.name}
                </h1>
                <p className="text-sm font-medium">
                  {consultation.doctor.email}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-medium">Date</p>
                <p className="text-sm">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-md my-2 flex flex-col gap-2">
              <p className="text-lg font-medium">Patient Details:</p>
              <p>Name: {consultation.patient.name}</p>
              <p>Email: {consultation.patient.email}</p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <p className="text-lg font-medium">Prescription</p>
              {med.map((med) => (
                <div
                  key={med.availableMedsId}
                  className="flex flex-col gap-2 rounded-md border-2 border-indigo-800 p-4"
                >
                  <p className="text-lg font-medium">
                    {
                      availableMeds?.find(
                        (availableMed) =>
                          availableMed.id === med.availableMedsId
                      )?.name
                    }
                  </p>
                  <p className="text-sm">Frequency: {med.frequency}</p>
                  <p className="text-sm">Strength: {med.strength}</p>
                  <p className="text-sm">Quantity: {med.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
          onClick={async () => {
            await pmeds.mutate({
              consultationId: consultationId as string,
              med,
            });
            router.push("/prescriptions");
          }}
        >
          Prescribe
        </button>
      </div>
    </Layout>
  );
};

export default PrescribePage;
