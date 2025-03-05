export default function DashboardPage() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Événements en cours</h2>
          <p className="text-gray-500">Nombre total : 12</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Utilisateurs Actifs</h2>
          <p className="text-gray-500">Super Admins : 2 | Agents : 5</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold">Taux de Participation</h2>
          <p className="text-gray-500">83% des employés inscrits participent</p>
        </div>
      </div>
    );
  }
  