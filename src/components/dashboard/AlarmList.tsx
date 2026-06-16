import React from 'react';
import { Card } from '../common/Card';

interface Alarm {
  id: number;
  message: string;
  severity: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlarmListProps {
  alarms: Alarm[];
  onAcknowledge: (id: number) => void;
}

export const AlarmList: React.FC<AlarmListProps> = ({ alarms, onAcknowledge }) => {
  const severityColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <Card title="Dernières alarmes">
      <div className="space-y-2">
        {alarms.length === 0 ? (
          <p className="text-gray-500">Aucune alarme</p>
        ) : (
          alarms.slice(0, 5).map((alarm) => (
            <div
              key={alarm.id}
              className={`p-3 rounded flex justify-between items-center ${severityColors[alarm.severity] || 'bg-gray-100'}`}
            >
              <div>
                <p className="font-medium">{alarm.message}</p>
                <p className="text-xs">{new Date(alarm.timestamp).toLocaleString()}</p>
              </div>
              {!alarm.acknowledged && (
                <button
                  onClick={() => onAcknowledge(alarm.id)}
                  className="text-sm bg-white px-2 py-1 rounded shadow"
                >
                  Acquitter
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};