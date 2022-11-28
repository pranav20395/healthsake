import { useUserContext } from "@/context/user.context";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const BillPages = () => {
  const router = useRouter();
  const ctxUser = useUserContext();

  if (!ctxUser) {
    router.push("/");
    return <></>;
  }

  const { billId } = router.query;

  if (!billId) {
    return <p>Loading..</p>;
  }

  const { data: billLink } = trpc.patient.getBillLink.useQuery({
    billId: billId as string,
  });

  if (!billLink) {
    return <p>Loading..</p>;
  }

  router.push(billLink);

  return <div>Loading...</div>;
};

export default BillPages;
