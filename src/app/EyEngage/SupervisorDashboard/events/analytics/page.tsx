"use client";
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { faker } from '@faker-js/faker';
import { Button } from "@/components/ui/button"; // Utilisation de Button ShadCN

Chart.register(...registerables);

const AnalyticsEventsPage = () => {
  // Données statiques
  const participationData = {
    labels: ['Participé', 'Intéressé', 'Non répondu'],
    datasets: [{
      data: [65, 25, 10],
      backgroundColor: ['#FFB500', '#1E1E2D', '#E5E7EB'],
    }]
  };

  const eventTypeData = {
    labels: ['Formation', 'Séminaire', 'Team Building', 'Conférence'],
    datasets: [{
      label: 'Participants',
      data: [120, 90, 70, 45],
      backgroundColor: '#FFB500',
      borderColor: '#1E1E2D',
    }]
  };

  const stats = [
    { title: "Événements total", value: "45", change: "+12% vs mois dernier" },
    { title: "Taux participation", value: "78%", change: "+8% vs dernier trimestre" },
    { title: "Nouveaux inscrits", value: "23", change: "En attente: 5" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-ey-yellow">
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <p className="text-3xl font-bold my-2">{stat.value}</p>
            <span className="text-ey-yellow text-sm">{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Répartition des participations</h2>
          <Doughnut data={participationData} />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Participation par type d'événement</h2>
          <Bar data={eventTypeData} />
        </div>
      </div>

      {/* Tableau des données */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-ey-dark-gray text-white">
            <tr>
              <th className="p-4 text-left">Événement</th>
              <th className="p-4">Inscrits</th>
              <th className="p-4">Participation</th>
              <th className="p-4">Satisfaction</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-4">Événement {i}</td>
                <td className="p-4 text-center">{faker.number.int({ max: 100 })}</td>
                <td className="p-4 text-center">{faker.number.int({ max: 100 })}%</td>
                <td className="p-4 text-center text-ey-yellow">★ {faker.number.float({ min: 3, max: 5 }).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsEventsPage;
