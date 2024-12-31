export const EmptyState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No messages found</h2>
        <p className="text-gray-600">This conversation appears to be empty or may have been deleted.</p>
      </div>
    </div>
  );
};