"use client";

import VendorSetupTimeline from "./VendorSetupTimeline";

export default function Sidebar() {
  return (
    <aside className="hidden lg:fixed left-0 top-0 h-screen w-64 border-r bg-white pt-16 z-30 lg:block">
      <div className="flex flex-col h-full">
        <div className="px-4 py-5">
          <VendorSetupTimeline />
        </div>
      </div>
    </aside>
  );
}
