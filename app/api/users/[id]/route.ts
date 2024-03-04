import { User } from "@/app/lib/definitions";
import { getUser } from "@/app/lib/users";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const user: User = await getUser(id);
  // console.log(user);
  return Response.json({ user });
}
