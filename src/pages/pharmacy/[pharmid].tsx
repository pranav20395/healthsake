import Layout from "@/client/Layout";
import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import {
  AddMedicine,
  addMedicine,
  UpdateMedicine,
  updateMedicine,
} from "@/utils/validation/pharm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import React, { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";

const Accordion: FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const [isOpen, setOpen] = useState(false);
  return (
    <div className="accordion-wrapper">
      <div
        className={`accordion-title ${isOpen ? "open" : ""}`}
        onClick={() => setOpen(!isOpen)}
      >
        {title}
      </div>
      <div className={`accordion-item ${!isOpen ? "collapsed" : ""}`}>
        <div className="accordion-content">{children}</div>
      </div>
    </div>
  );
};

const PharmPage = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  const [cart, setCart] = useState<AddMedicine[]>([]);
  const [loggingErrors, setLoggingErrors] = useState<string>("");

  const addToCart = (medicine: AddMedicine) => {
    setCart((prev) => [...prev, medicine]);
  };

  const removeFromCart = (medicine: AddMedicine) => {
    setCart((prev) => prev.filter((m) => m.name !== medicine.name));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddMedicine>({
    resolver: zodResolver(addMedicine),
  });

  const {
    register: reg,
    handleSubmit: hanSubmit,
    formState: { errors: errs },
  } = useForm<UpdateMedicine>({
    resolver: zodResolver(updateMedicine),
  });

  const addMed = trpc.pharm.addMedicineToPharmacy.useMutation({
    onSuccess: () => router.reload(),
    onError: (err) => setLoggingErrors(err.message),
  });
  const updateMed = trpc.pharm.updateMedicineOfPharmacy.useMutation({
    onSuccess: () => router.reload(),
    onError: (err) => setLoggingErrors(err.message),
  });

  const onSubmit = useCallback(
    async (data: AddMedicine) => {
      addMed.mutate(data);
    },
    [addMed]
  );

  const onUpdate = useCallback(
    async (data: UpdateMedicine) => {
      updateMed.mutate(data);
    },
    [updateMed]
  );

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { pharmid } = router.query;

  if (!pharmid) {
    return <p>Loading..</p>;
  }

  const { data } = trpc.pharm.getAllMedicinesOfPharmacy.useQuery({
    pharmid: pharmid.toString(),
  });

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

  if (data?.pharmacy.userId !== ctxUser.id) {
    return (
      <Layout title={`${data?.pharmacy.user.name} Pharmacy`}>
        <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
          <h1 className="my-10 text-3xl font-medium">
            {`${data?.pharmacy.user.name} Pharmacy`}
          </h1>
          <Accordion title={`Cart (${cart.length} items)`}>
            <div className="flex gap-10">
              {cart.length === 0 ? (
                <p className="w-full text-center text-gray-400">
                  No items in cart. Add Items from below.
                </p>
              ) : (
                <>
                  <div className="flex w-1/2 flex-col gap-4">
                    {cart.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-2 rounded-lg bg-white/30 px-8 py-4"
                      >
                        <div className="flex flex-row gap-10">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20"
                          />
                          <div>
                            <p className="text-lg font-medium">{item.name}</p>
                            <p className="text-lg font-medium">
                              ₹ {item.price}
                            </p>
                          </div>
                          <button
                            className="rounded-xl bg-red-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
                            onClick={(e) => removeFromCart(item)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex w-1/2 flex-col justify-evenly rounded-xl bg-indigo-600/80 px-10 text-gray-200">
                    <h3 className="text-2xl">Summary</h3>
                    <p>Total: ₹ {cart.reduce((a, b) => a + b.price, 0)}</p>
                    <label htmlFor="prescription" className="flex gap-8">
                      Prescription
                      <select className="rounded-xl bg-indigo-600/80 text-gray-200">
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                      </select>
                    </label>
                    <button className="rounded-xl bg-indigo-300 p-3 px-8 text-sm text-indigo-800 transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900">
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </Accordion>
          {data?.medicines.length === 0 && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-center text-gray-400"> No medicines found</p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {data?.medicines.map((med) => (
              <div
                key={med.id}
                className="flex gap-10 rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8"
              >
                <img src={med.image} alt={med.name} />
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-medium">{med.name}</p>
                  <p className=" font-medium">₹ {med.price}</p>
                  <p className=" font-medium">{med.quantity} left</p>
                  <button
                    className="rounded-xl bg-white p-3 px-8 text-sm text-black transition-all ease-in-out hover:shadow-2xl disabled:bg-gray-200"
                    onClick={(e) => addToCart(med)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout title={`Manage ${data?.pharmacy.user.name} Pharmacy`}>
        <div className="mx-auto flex w-11/12 flex-col gap-10 pt-6">
          <h1 className="my-10 text-3xl font-medium">
            {`Manage ${data?.pharmacy.user.name} Pharmacy`}
          </h1>
          {/* Add new Medicine */}
          <form
            className="flex justify-between gap-6 rounded-lg border-2 border-indigo-800 p-4 px-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <label className="flex flex-col gap-2 text-sm">
              Image Link:
              <input
                className="rounded-lg py-2 px-2 text-black"
                type="text"
                {...register("image")}
              />
              {errors.image && (
                <p className="text-xs text-red-500">{errors.image?.message}</p>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Medicine Name:
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
              Price:
              <input
                className="rounded-lg py-2 px-2 text-black"
                type="number"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price?.message}</p>
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
              <input
                className="rounded-lg py-2 px-2 text-black"
                type="text"
                {...reg("id")}
              />
              {errs.image && (
                <p className="text-xs text-red-500">{errs.image?.message}</p>
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
            <label className="flex flex-col gap-2 text-sm">
              Medicine Name:
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
              Price:
              <input
                className="rounded-lg py-2 px-2 text-black"
                type="number"
                {...reg("price", { valueAsNumber: true })}
              />
              {errs.price && (
                <p className="text-xs text-red-500">{errs.price?.message}</p>
              )}
            </label>
            <label className="flex flex-col gap-2 text-sm">
              Quantity:
              <input
                className="rounded-lg py-2 px-2 text-black"
                type="number"
                {...reg("quantity", { valueAsNumber: true })}
              />
              {errs.quantity && (
                <p className="text-xs text-red-500">{errs.quantity?.message}</p>
              )}
            </label>
            <button
              className="rounded-xl bg-indigo-600 p-3 px-8 text-sm text-white transition-all ease-in-out hover:shadow-2xl disabled:bg-indigo-900"
              type="submit"
            >
              Update
            </button>
          </form>
          {loggingErrors && (
            <p className="rounded-lg border-2 border-red-500 bg-red-200 p-2 text-sm text-red-600">
              Something went wrong! {loggingErrors}
            </p>
          )}
          {data?.medicines.length === 0 && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-center text-gray-400"> No medicines found</p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {data?.medicines.map((med) => (
              <div
                key={med.id}
                className="flex gap-10 rounded-lg border-4 border-indigo-800 bg-indigo-500/60 p-4 px-8"
              >
                <img src={med.image} alt={med.name} />
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-medium">{med.name}</p>
                  <p className=" font-medium">₹ {med.price}</p>
                  <p className=" font-medium">{med.quantity} left</p>
                  <p className="text-sm opacity-50">#{med.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
};

export default PharmPage;
