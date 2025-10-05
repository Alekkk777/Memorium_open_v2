// components/palace/RecallStatsView.tsx - Visualizzazione Statistiche
import { Trophy, TrendingUp, Calendar, Target, Brain, CheckCircle } from 'lucide-react';
import { getRecallStats, getRecallSessionsByPalace } from '@/lib/recallStorage';
import { Palace } from '@/types';

interface RecallStatsViewProps {
  palace: Palace;
}

export default function RecallStatsView({ palace }: RecallStatsViewProps) {
  const stats = getRecallStats(palace._id || palace._id);
  const sessions = getRecallSessionsByPalace(palace._id || palace._id);

  if (stats.totalSessions === 0) {
    return (
      <div className="text-center py-8 px-4">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Nessuna sessione ancora
        </h3>
        <p className="text-sm text-gray-500">
          Inizia una sessione Recall per tracciare i tuoi progressi!
        </p>
      </div>
    );
  }

  const lastSession = sessions[sessions.length - 1];
  const lastAccuracy = lastSession?.results?.accuracy || 0;
  const trend = stats.improvementTrend;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Best</p>
          </div>
          <p className="text-3xl font-bold text-blue-700">
            {stats.bestAccuracy.toFixed(0)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">Media</p>
          </div>
          <p className="text-3xl font-bold text-purple-700">
            {stats.averageAccuracy.toFixed(0)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">Sessioni</p>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {stats.totalSessions}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-5 h-5 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <p className="text-sm font-medium text-orange-900">Trend</p>
          </div>
          <p className={`text-3xl font-bold ${trend >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(0)}%
          </p>
        </div>
      </div>

      {lastSession && lastSession.results && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Ultima Sessione
          </h4>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-sm text-gray-600">Ricordate</p>
              <p className="text-2xl font-bold text-green-600">
                {lastSession.results.remembered}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dimenticate</p>
              <p className="text-2xl font-bold text-red-600">
                {lastSession.results.forgotten}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Accuratezza</p>
              <p className="text-2xl font-bold text-blue-600">
                {lastAccuracy.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              {new Date(lastSession.endTime || lastSession.startTime).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      )}

      <div className={`p-4 rounded-xl ${
        stats.averageAccuracy >= 80 ? 'bg-green-50 border-2 border-green-500' :
        stats.averageAccuracy >= 60 ? 'bg-yellow-50 border-2 border-yellow-500' :
        'bg-red-50 border-2 border-red-500'
      }`}>
        <p className="text-sm font-medium">
          {stats.averageAccuracy >= 80 
            ? '🎉 Ottimo livello! Continua con le revisioni.'
            : stats.averageAccuracy >= 60
            ? '👍 Buon progresso! Continua ad esercitarti.'
            : '💪 Continua! La memoria migliora con la pratica.'}
        </p>
      </div>

      {sessions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Cronologia
          </h4>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions.slice(-10).reverse().map((session, index) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Sessione #{sessions.length - index}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.startTime).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                
                {session.results && (
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      session.results.accuracy >= 80 ? 'text-green-600' :
                      session.results.accuracy >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {session.results.accuracy.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.results.remembered}/{session.results.totalAnnotations}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}