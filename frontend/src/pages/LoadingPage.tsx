const LoadingPage = ({ text = "Finding a match..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-72 rounded-xl bg-normal shadow-lg px-6 py-20 flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-5 border-gray-300 border-t-verydark" />
        <p className="text-base text-verydark text-center">{text}</p>
      </div>
    </div>
  );
};

export default LoadingPage;
