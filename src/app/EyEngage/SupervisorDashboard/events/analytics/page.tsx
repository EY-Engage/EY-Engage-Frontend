"use client";
import { useEffect, useState } from "react";
import RouteGuard from "@/components/RouteGuard";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { 
  getEventAnalytics, 
  getEventTrends
} from "@/lib/services/eventService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ReportModal from "./ReportModal";
import { 
  Loader2, TrendingUp, Users, Calendar, Activity,
  Award, Target, BarChart3, PieChart, Download
} from "lucide-react";
import { EventAnalyticsDto, EventTrendDto } from "@/types/types";
import EnhancedLoading, { CardSkeleton, TableSkeleton } from "@/components/SkeletonLoader";

Chart.register(...registerables);

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function EventsAnalyticsPage() {
  const [analytics, setAnalytics] = useState<EventAnalyticsDto | null>(null);
  const [trends, setTrends] = useState<EventTrendDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const { user, roles } = useAuth();
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setChartLoading(true);
      try {
        const userId = roles.includes("AgentEY") ? user?.id : undefined;
        
        const [analyticsData, trendsData] = await Promise.all([
          getEventAnalytics(userId),
          getEventTrends(userId)
        ]);
        
        setAnalytics(analyticsData);
        setTrends(trendsData);
        
        // Simuler le chargement des graphiques
        setTimeout(() => setChartLoading(false), 500);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, roles]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const url = `${BASE}/api/event/analytics/report`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include"
      });
      
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error("Erreur de génération du rapport", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Configuration des graphiques avec les couleurs EY
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#1A1A24',
          font: {
            family: 'Inter',
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: '#1A1A24',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter',
          size: 12
        },
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: '#1A1A24',
          font: {
            family: 'Inter',
            size: 11
          }
        },
        grid: {
          color: '#E7E7EA',
          borderDash: [3, 3]
        }
      },
      x: {
        ticks: { 
          color: '#1A1A24',
          font: {
            family: 'Inter',
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Données pour le graphique circulaire
  const departmentChartData = {
    labels: analytics?.departmentStats.map(d => d.departmentName) || [],
    datasets: [{
      data: analytics?.departmentStats.map(d => d.totalEvents) || [],
      backgroundColor: [
        '#FFE600',
        '#1A1A24',
        '#4EBEEB',
        '#6E2585',
        '#10B981',
        '#F97316'
      ],
      borderWidth: 2,
      borderColor: '#FFFFFF'
    }]
  };

  // Données pour le graphique linéaire
  const monthlyChartData = {
    labels: analytics?.monthlyStats.map(m => `${m.month}/${m.year}`) || [],
    datasets: [
      {
        label: "Événements",
        data: analytics?.monthlyStats.map(m => m.eventsCount) || [],
        borderColor: '#FFE600',
        backgroundColor: 'rgba(255, 230, 0, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#FFE600',
        pointBorderColor: '#1A1A24',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      },
      {
        label: "Participants",
        data: analytics?.monthlyStats.map(m => m.participantsCount) || [],
        borderColor: '#4EBEEB',
        backgroundColor: 'rgba(78, 190, 235, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#4EBEEB',
        pointBorderColor: '#1A1A24',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  // Données pour le graphique à barres
  const popularEventsChartData = {
    labels: analytics?.popularEvents.map(e => e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title) || [],
    datasets: [
      {
        label: "Participants",
        data: analytics?.popularEvents.map(e => e.participants) || [],
        backgroundColor: '#FFE600',
        borderColor: '#1A1A24',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40
      },
      {
        label: "Intéressés",
        data: analytics?.popularEvents.map(e => e.interests) || [],
        backgroundColor: '#4EBEEB',
        borderColor: '#1A1A24',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40
      }
    ]
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return <EnhancedLoading fullScreen message="Chargement des analyses..." variant="pulse" />;
  }

  return (
    <RouteGuard allowedRoles={[ 'Admin', 'AgentEY']}>
      <div className="min-h-screen bg-gradient-to-br from-ey-light-gray to-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-ey-yellow to-ey-yellow-dark rounded-ey-2xl p-8 mb-8 shadow-ey-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-ey-black mb-2 flex items-center gap-3">
                  <BarChart3 className="h-10 w-10" />
                  Analytique des Événements
                </h1>
                <p className="text-ey-black/70 text-lg">
                  Tableau de bord complet des performances et tendances
                </p>
              </div>
              
              <Button 
                onClick={generateReport} 
                disabled={isLoading || isGenerating}
                className="btn-ey-secondary flex items-center gap-2 h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Générer Rapport IA
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Événements Totaux" 
              value={analytics?.totalEvents || 0}
              description="Événements organisés"
              icon={<Calendar className="h-6 w-6 text-ey-yellow" />}
              trend="+12%"
              loading={chartLoading}
            />
            <StatCard 
              title="Participants" 
              value={analytics?.totalParticipants || 0}
              description="Participations confirmées"
              icon={<Users className="h-6 w-6 text-ey-accent-blue" />}
              trend="+8%"
              loading={chartLoading}
            />
            <StatCard 
              title="Taux de Participation" 
              value={formatPercentage(analytics?.participationRate || 0)}
              description="Participants / Intéressés"
              icon={<Target className="h-6 w-6 text-ey-green" />}
              trend="+5%"
              loading={chartLoading}
            />
            <StatCard 
              title="Moy. Participation" 
              value={analytics?.avgParticipationPerEvent?.toFixed(1) || "0.0"}
              description="Participants par événement"
              icon={<Award className="h-6 w-6 text-ey-purple" />}
              trend="+15%"
              loading={chartLoading}
            />
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {chartLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <Card className="card-ey">
                  <CardHeader className="bg-gradient-to-r from-ey-black to-ey-gray-800 text-white rounded-t-ey-xl">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Activité par Département
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[400px]">
                      <Pie 
                        data={departmentChartData} 
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: '#1A1A24',
                                padding: 20,
                                font: {
                                  family: 'Inter',
                                  size: 12,
                                  weight: '500'
                                }
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-ey">
                  <CardHeader className="bg-gradient-to-r from-ey-black to-ey-gray-800 text-white rounded-t-ey-xl">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Évolution Mensuelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[400px]">
                      <Line 
                        data={monthlyChartData} 
                        options={chartOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Événements populaires */}
          <div className="mb-8">
            {chartLoading ? (
              <CardSkeleton />
            ) : (
              <Card className="card-ey">
                <CardHeader className="bg-gradient-to-r from-ey-yellow to-ey-yellow-dark rounded-t-ey-xl">
                  <CardTitle className="text-xl font-bold text-ey-black flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Top Événements par Participation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[400px]">
                    <Bar 
                      data={popularEventsChartData} 
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            display: true,
                            position: 'top',
                            labels: {
                              color: '#1A1A24',
                              padding: 20,
                              font: {
                                family: 'Inter',
                                size: 12,
                                weight: '600'
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tableau des tendances */}
          {chartLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : (
            <Card className="card-ey overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-ey-black to-ey-gray-800 text-white">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendance des Événements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-ey-light-gray border-b-2 border-ey-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-ey-black uppercase tracking-wider">
                          Événement
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-ey-black uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-ey-black uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-ey-black uppercase tracking-wider">
                          Intéressés
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-ey-black uppercase tracking-wider">
                          Taux Conversion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-ey-gray-200">
                      {trends.map((event, index) => (
                        <tr key={index} className="hover:bg-ey-yellow/5 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-ey-black">
                              {event.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-ey-gray-600">
                              {new Date(event.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="badge-ey-info">
                              {event.participants}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="badge-ey-warning">
                              {event.interests}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              event.conversionRate > 0.7 
                                ? 'bg-ey-green/10 text-ey-green border border-ey-green/20'
                                : event.conversionRate > 0.4
                                ? 'bg-ey-yellow/10 text-ey-orange border border-ey-orange/20'
                                : 'bg-ey-red/10 text-ey-red border border-ey-red/20'
                            }`}>
                              {(event.conversionRate * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Modal pour afficher le rapport IA */}
        <ReportModal 
          report={report} 
          onClose={() => setReport(null)} 
        />
      </div>
    </RouteGuard>
  );
}

// Composant de carte de statistique amélioré
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon,
  trend,
  loading
}: { 
  title: string; 
  value: string | number; 
  description: string; 
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <Card className="card-ey">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-ey-gray-200 rounded-full mb-4" />
            <div className="h-4 bg-ey-gray-200 rounded w-3/4 mb-2" />
            <div className="h-8 bg-ey-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-ey-gray-200 rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-ey hover:shadow-ey-2xl transition-all duration-300 group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-ey-light-gray rounded-ey-lg group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          {trend && (
            <span className="text-ey-green text-sm font-semibold">
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-ey-gray-600">{title}</p>
          <div className="text-3xl font-bold text-ey-black">{value}</div>
          <p className="text-xs text-ey-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};