import React from 'react'
import { Pane, Heading, Text, Button, majorScale } from 'evergreen-ui'
import { MapPin } from 'lucide-react'

interface WeatherDisplayProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  btnIntent: any;
  loading: boolean;
  onCheck: () => void;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  icon, title, desc, color, btnIntent, loading, onCheck
}) => (
  <Pane 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    textAlign="center" 
    zIndex={10} 
    padding={majorScale(4)} 
    width="100%" 
    maxWidth={480}
  >
    <Pane marginBottom={majorScale(5)} style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}>
      {icon}
    </Pane>
    
    <Heading 
      size={900} 
      fontWeight={900} 
      color={color} 
      style={{ letterSpacing: '-0.05em', lineHeight: 1, textTransform: 'uppercase' }}
    >
      {title}
    </Heading>
    
    <Text 
      size={600} 
      marginTop={majorScale(2)} 
      color={color} 
      style={{ opacity: 0.7, fontWeight: 500, letterSpacing: '-0.01em', maxWidth: '85%' }}
    >
      {desc}
    </Text>
    
    <Button
      marginTop={majorScale(8)} 
      onClick={onCheck} 
      isLoading={loading}
      iconBefore={MapPin} // Evergreen Button pinter, dia bisa nerima komponen Lucide langsung
      height={64} 
      paddingX={majorScale(5)}
      appearance="primary" 
      intent={btnIntent} 
      borderRadius={32} // Dibuat lebih bulat biar makin cakep
      fontSize={18} 
      fontWeight={700} 
      style={{ 
        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      CEK LOKASI SAYA
    </Button>
  </Pane>
)