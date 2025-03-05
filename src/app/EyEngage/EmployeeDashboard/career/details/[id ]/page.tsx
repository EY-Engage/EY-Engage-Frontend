"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function JobDetails({ opportunity }) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-ey-black hover:text-ey-accentBlue"
      >
        <ArrowLeft size={20} className="mr-2" /> Retour
      </button>
      <div className="bg-ey-white p-6 rounded-lg shadow-md border border-ey-darkGray">
        <h1 className="text-3xl font-bold text-ey-black mb-4">{opportunity.title}</h1>
        <p className="mb-4">{opportunity.description}</p>
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="bg-ey-lightGray px-3 py-1 rounded-full text-sm">
            {opportunity.type}
          </span>
          <span className="bg-ey-lightGray px-3 py-1 rounded-full text-sm">
            {opportunity.experience}
          </span>
          <span className="bg-ey-lightGray px-3 py-1 rounded-full text-sm">
            {opportunity.location}
          </span>
        </div>
        <button
          className="bg-ey-black text-ey-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          onClick={() => router.push(`/career/apply/${opportunity.id}`)}
        >
          Postuler maintenant
        </button>
      </div>
    </div>
  );
}
