import React from "react";

type Props = {};

const Loading = (props: Props) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div
        className="animate-spin inline-block w-12 h-12 border-4 border-t-4 border-t-transparent border-blue-500 rounded-full"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
