import React from 'react';

const OwnerProfileEdit = () => {
  return (
    <>
      {/* Business Information */}
      <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] p-5 mb-5 rounded-[20px] flex flex-col">
        <h3 className="text-lg font-bold flex items-center bg-[var(--panel-bg)] p-5 mb-5 rounded-[20px]">
          Business Information
        </h3>

        <div className="p-2.5 mb-2.5 rounded-[20px]">
          <label className="block mb-2 text-sm font-medium">
            Name of the business:
          </label>
          <input
            type="text"
            className="border border-[var(--primary-bg)] p-2.5 mb-5 rounded-[10px] w-full placeholder:text-[var(--primary-bg)] placeholder:opacity-50 max-[900px]:w-full max-[900px]:box-border max-[900px]:mb-3"
            placeholder="Enter Business Name Here"
          />
        </div>

        <div className="p-2.5 mb-2.5 rounded-[20px]">
          <label className="block mb-2 text-sm font-medium">
            Business Address:
          </label>
          <input
            type="text"
            className="border border-[var(--primary-bg)] p-2.5 mb-5 rounded-[10px] w-full placeholder:text-[var(--primary-bg)] placeholder:opacity-50 max-[900px]:w-full max-[900px]:box-border max-[900px]:mb-3"
            placeholder="Enter Business Address Here"
          />
        </div>

        <div className="p-2.5 mb-2.5 rounded-[20px]">
          <label className="block mb-2 text-sm font-medium">
            Year started:
          </label>
          <input
            type="date"
            className="border border-[var(--primary-bg)] p-2.5 mb-5 rounded-[10px] w-full placeholder:text-[var(--primary-bg)] placeholder:opacity-50 max-[900px]:w-full max-[900px]:box-border max-[900px]:mb-3"
          />
        </div>

        <div className="flex justify-end gap-2 max-[900px]:flex-col max-[900px]:items-stretch">
          <button className="bg-[var(--peach-bg)] text-[var(--primary-bg)] px-5 py-2.5 border-none rounded-[10px] hover:opacity-90 max-[900px]:w-full max-[900px]:p-3">
            Create
          </button>
          <button className="bg-[var(--peach-bg)] text-[var(--primary-bg)] px-5 py-2.5 border-none rounded-[10px] hover:opacity-90 max-[900px]:w-full max-[900px]:p-3">
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default OwnerProfileEdit;
