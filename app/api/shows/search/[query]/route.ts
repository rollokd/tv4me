export async function GET(
  request: Request,
  context: { params: { query: string } }
) {
  const query = context.params.query;
  console.log("got request", query);
}
