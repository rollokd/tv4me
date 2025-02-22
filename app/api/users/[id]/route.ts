import { User } from "@/app/lib/definitions";
import { getUser } from "@/app/lib/users";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const user: User = await getUser(id);
  // console.log(user);
  return Response.json({ user });
}
