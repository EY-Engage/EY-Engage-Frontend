"use client";
import { useRouter } from "next/navigation";

const suggestedJobs = [
  {
    id: 3,
    title: "Développeur Full-Stack",
    type: "Full-Time",
    experience: "3-5 ans",
    location: "Tunis",
  },
  {
    id: 4,
    title: "Consultant Senior",
    type: "Part-Time",
    experience: "5+ ans",
    location: "Sousse",
  },
];

export default function JobSuggestions() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ey-black mb-6">Suggestions de Postes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestedJobs.map((job) => (
          <div
            key={job.id}
            className="bg-ey-white p-6 rounded-lg shadow-md border border-ey-darkGray"
          >
            <h2 className="text-xl font-bold text-ey-black mb-2">{job.title}</h2>
            <div className="flex gap-2 flex-wrap mb-4">
              <span className="bg-ey-lightGray px-3 py-1 rounded-full text-sm">
                {job.type}
              </span>
              <span className="bg-ey-lightGray px-3 py-1 rounded-full text-sm">
                {job.experience}
              </span>
              <span className="bg-ey-lightGray px-3 py-1 rounded-full text-sm">
                {job.location}
              </span>
            </div>
            <button
              className="bg-ey-black text-ey-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              onClick={() => router.push(`details/${job.id}`)}
            >
              Voir Détails
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
