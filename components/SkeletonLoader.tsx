import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm animate-pulse flex flex-col justify-between">
      <div className="w-full aspect-[4/5] rounded-2xl bg-gray-200 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded-md w-1/3" />
        <div className="h-4 bg-gray-200 rounded-md w-2/3" />
        <div className="h-3 bg-gray-200 rounded-md w-1/2" />
        <div className="h-8 bg-gray-200 rounded-2xl w-full mt-2" />
      </div>
    </div>
  );
};

export const CategoryPillsSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 my-3 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-12" />
      </div>
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-[68px] h-[68px] rounded-2xl bg-gray-200 mb-2" />
            <div className="h-2.5 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
