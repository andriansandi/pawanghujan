// src/components/AIQuoteCard.tsx
import React from 'react'
import { Pane, Text, majorScale } from 'evergreen-ui'

interface AIQuoteCardProps {
  quote: string;
  color: string;
}

export const AIQuoteCard: React.FC<AIQuoteCardProps> = ({ quote, color }) => {
  if (!quote) return null;

  return (
    <Pane
      marginTop={majorScale(5)}
      padding={majorScale(3)}
      borderRadius={20}
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
      className="fade-in-up" // Animasi dari App.css
      style={{
        maxWidth: '380px',
        width: '90%',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${color}30`,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Dekorasi tanda kutip */}
      <Text
        position="absolute"
        top={-15}
        left={15}
        size={900}
        color={color}
        style={{ opacity: 0.3, fontFamily: 'serif', userSelect: 'none' }}
      >
      </Text>

      <Text
        size={500}
        fontStyle="italic"
        color={color}
        textAlign="center"
        style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "15px",
            opacity: 0.9,
            lineHeight: 1.8,
            whiteSpace: 'pre-line', // Menjaga format sajak
            fontWeight: 300,
            letterSpacing: '0.3px',
        }}
      >
        {quote}
      </Text>

      <Text
        marginTop={majorScale(2)}
        size={300}
        color={color}
        style={{ opacity: 0.4, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}
      >
        Bisikan Langit
      </Text>
    </Pane>
  )
}