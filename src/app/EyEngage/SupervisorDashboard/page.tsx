import RouteGuard from '@/components/RouteGuard';

export default function SupervisorDashboard() {
  return (
    <RouteGuard allowedRoles={['SuperAdmin', 'Admin', 'AgentEY']}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Tableau de Bord Supervision</h1>
        
        {/* Contenu supplémentaire spécifique au tableau de bord supervision */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold">Actions Administratives</h2>
            <ul className="mt-4 space-y-3">
              <li className="text-gray-600">• Gestion des utilisateurs</li>
              <li className="text-gray-600">• Audit des activités</li>
              <li className="text-gray-600">• Configuration système</li>
            </ul>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold">Statistiques Avancées</h2>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600">Taux d'engagement global : 78%</p>
              <p className="text-gray-600">Alertes non lues : 3</p>
              <p className="text-gray-600">Dernière activité : 2h</p>
            </div>
          </div>
        </section>
      </div>
      </RouteGuard>
  );
}