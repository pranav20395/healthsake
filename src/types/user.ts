import { Individual, Organisation, User } from "@prisma/client";

export type UserProps = User & {
  individual: Individual;
  organisation: Organisation;
};
