import React from 'react';

const BusinessEdit = () => {
  return (
    <>
        {/* Business Owner Information */}
      <div className="bg-[var(--card-bg)] text-[var(--primary-bg)] p-5 mb-5 rounded-[20px] flex flex-col">
        <h3 className="text-lg font-bold flex items-center bg-[var(--panel-bg)] p-5 mb-5 rounded-[20px]">
          Business Owner Information
        </h3>

        <div className="p-2.5 mb-2.5 rounded-[20px]">
          <label className="block mb-2 text-sm font-medium">
            Name of Owner:
          </label>
          <input
            type="text"
            className="border border-[var(--primary-bg)] p-2.5 mb-5 rounded-[10px] w-full placeholder:text-[var(--primary-bg)] placeholder:opacity-50 max-[900px]:w-full max-[900px]:box-border max-[900px]:mb-3"
            placeholder="Marlene Fronde"
          />
        </div>

        <div className="p-2.5 mb-2.5 rounded-[20px]">
          <label className="block mb-2 text-sm font-medium">
            Owner Address:
          </label>
          <input
            type="text"
            className="border border-[var(--primary-bg)] p-2.5 mb-5 rounded-[10px] w-full placeholder:text-[var(--primary-bg)] placeholder:opacity-50 max-[900px]:w-full max-[900px]:box-border max-[900px]:mb-3"
            placeholder="Block 52A Lot 6 Phase 1 Southville BB Brgy San Isidro Rodriguez Rizal"
          />
        </div>

        <div className="p-2.5 mb-2.5 rounded-[20px]">
          <label className="block mb-2 text-sm font-medium">
            Owner Birthday:
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
  )
}

export default BusinessEdit;