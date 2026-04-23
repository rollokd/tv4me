import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WatchListPage() {
  return (
    <div className="p-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Watch list</CardTitle>
          <CardDescription>
            Ranked lists and reviews from your Marathon export are planned for a
            later release. For now, use <strong>My Shows</strong> and{" "}
            <strong>Search</strong> to manage your library.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
