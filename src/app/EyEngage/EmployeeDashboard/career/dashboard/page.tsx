"use client";
const applications = [
  {
    id: 1,
    jobTitle: "Consultant Junior",
    status: "En cours",
    appliedDate: "15/02/2025",
  },
  {
    id: 2,
    jobTitle: "Senior Manager",
    status: "Refusé",
    appliedDate: "10/02/2025",
  },
];

export default function ApplicationTracking() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-ey-black mb-6">Suivi des Candidatures</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="bg-ey-white p-6 rounded-lg shadow-md border border-ey-darkGray">
            <h2 className="text-xl font-bold text-ey-black mb-2">{app.jobTitle}</h2>
            <p>Date de candidature : {app.appliedDate}</p>
            <p className={`font-bold ${app.status === "En cours" ? "text-yellow-500" : "text-red-500"}`}>
              Statut : {app.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
