import StoresList from "../StoresList";

const UserDashboard = () => {
  // This page is intentionally thin — it's the landing route for the USER role,
  // and its only job is to frame the StoresList with a page-level heading.

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Dashboard
        </h1>

        <p className="mt-1.5 text-sm text-neutral-500">
          Browse stores and share your ratings.
        </p>
      </div>

      <StoresList />
    </div>
  );
};

export default UserDashboard;
