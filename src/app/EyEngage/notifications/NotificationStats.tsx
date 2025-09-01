'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { NotificationStats as NotificationStatsType } from '@/types/types';

interface NotificationStatsProps {
  stats: NotificationStatsType | null;
}

export default function NotificationStats({ stats }: NotificationStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900">Statistiques des notifications</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalNotifications.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Non lues</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.unreadNotifications.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Taux de lecture</p>
              <p className="text-2xl font-bold text-green-900">{Math.round(stats.readRate * 100)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Types actifs</p>
              <p className="text-2xl font-bold text-purple-900">{stats.typeStats.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Type Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques par type</h3>
        <div className="space-y-3">
          {stats.typeStats.map((typeStat) => (
            <div key={typeStat.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{typeStat.type.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{typeStat.count} notifications</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${typeStat.readRate * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{Math.round(typeStat.readRate * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}