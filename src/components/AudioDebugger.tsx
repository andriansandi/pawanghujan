import React from 'react'
import { Pane, Text, Badge, Button, majorScale } from 'evergreen-ui'

interface AudioDebuggerProps {
  status: Record<string, string>;
  onForcePlay: () => void;
}

export const AudioDebugger: React.FC<AudioDebuggerProps> = ({ status, onForcePlay }) => {
  const getBadgeColor = (text: string): "green" | "red" | "blue" | "neutral" => {
    if (text.includes("playing") || text.includes("ready")) return "green";
    if (text.includes("blocked") || text.includes("error")) return "red";
    if (text.includes("unlocked")) return "blue";
    return "neutral";
  };

  return (
    <Pane
      position="fixed"
      bottom={majorScale(10)}
      right={majorScale(2)}
      backgroundColor="rgba(0,0,0,0.85)"
      padding={majorScale(2)}
      borderRadius={12}
      zIndex={1000}
      width={220}
      className="audio-debug-panel"
      style={{ 
        backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      <Text color="white" size={300} fontWeight="bold" display="block" marginBottom={majorScale(1)}>
        Audio Debug Status:
      </Text>

      {Object.entries(status).map(([name, stat]) => (
        <Pane key={name} display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
          <Text color="#999" size={300} textTransform="capitalize">
            {name}:
          </Text>
          <Badge 
            color={getBadgeColor(stat)} 
            isSolid={stat.includes("playing")}
          >
            {stat}
          </Badge>
        </Pane>
      ))}

      <Button 
        size="small" 
        marginTop={majorScale(2)} 
        width="100%" 
        onClick={onForcePlay}
        appearance="primary"
        intent="none" // Biar ga tabrakan sama warna Evergreen
        height={28}
        fontSize={11}
        className="debug-force-btn"
      >
        FORCE PLAY CURRENT
      </Button>
    </Pane>
  );
};