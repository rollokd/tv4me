import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium">Coming soon...</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
