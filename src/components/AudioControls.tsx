import { Pane, Button, majorScale } from 'evergreen-ui'
import { Play, Pause, Volume2, VolumeX, Bug } from 'lucide-react'

interface AudioControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  showDebugger: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleDebug: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying, isMuted, showDebugger, onTogglePlay, onToggleMute, onToggleDebug
}) => (
  <Pane position="fixed" top={majorScale(4)} display="flex" gap={majorScale(2)} zIndex={100}>
    <Pane display="flex" gap={majorScale(1)} padding={majorScale(1)} backgroundColor="rgba(0,0,0,0.7)" borderRadius={40} style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
      <Button onClick={onTogglePlay} appearance="minimal" borderRadius="50%" height={48} width={48} className="audio-control-btn">
        {isPlaying ? <Pause color="white" size={24} /> : <Play color="white" size={24} />}
      </Button>
      <Button onClick={onToggleMute} appearance="minimal" borderRadius="50%" height={48} width={48} className="audio-control-btn">
        {isMuted ? <VolumeX color="white" size={24} /> : <Volume2 color="white" size={24} />}
      </Button>
    </Pane>
    {showDebugger && (
      <Button 
        onClick={onToggleDebug} 
        appearance="minimal" 
        borderRadius="50%" 
        height={48} 
        width={48} 
        backgroundColor="rgba(0,0,0,0.4)" 
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
         <Bug color="white" size={20} />
      </Button>
    )}
  </Pane>
)