import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const PrescribePages = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  const getPrescriptionLinkMutation =
    trpc.patient.getPrescriptionLink.useMutation({
      onSuccess: (data) => {
        router.push(data);
      },
    });

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { prescriptionId } = router.query;

  if (!prescriptionId) {
    return <p>Loading..</p>;
  }

  return (
    <div>
      <button
        onClick={(e) =>
          getPrescriptionLinkMutation.mutate({
            prescriptionId: prescriptionId.toString(),
          })
        }
      >
        Prescribe
      </button>
    </div>
  );
};

export default PrescribePages;
