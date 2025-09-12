import React, { useState, useEffect } from 'react';

interface SubtitleCue {
  startTime: number;
  endTime: number;
  text: string;
}

interface SubtitleOverlayProps {
  subtitle: {
    id: string;
    label: string;
    language: string;
    url: string;
  } | null;
  currentTime: number;
  isVisible: boolean;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ subtitle, currentTime, isVisible }) => {
  const [cues, setCues] = useState<SubtitleCue[]>([]);
  const [currentCue, setCurrentCue] = useState<SubtitleCue | null>(null);

  // Parse WebVTT content
  const parseWebVTT = (content: string): SubtitleCue[] => {
    const lines = content.split('\n');
    const parsedCues: SubtitleCue[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Skip WEBVTT header and empty lines
      if (line === 'WEBVTT' || line === '' || line.match(/^\d+$/)) {
        i++;
        continue;
      }

      // Look for timestamp line (format: 00:00:00.000 --> 00:00:00.000)
      if (line.includes('-->')) {
        const [startStr, endStr] = line.split('-->').map(s => s.trim());
        const startTime = parseTimestamp(startStr);
        const endTime = parseTimestamp(endStr);
        
        // Get subtitle text (next line(s))
        i++;
        let text = '';
        while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
          if (text) text += '\n';
          text += lines[i].trim();
          i++;
        }

        if (text) {
          parsedCues.push({ startTime, endTime, text });
        }
      } else {
        i++;
      }
    }

    return parsedCues;
  };

  // Parse timestamp (00:00:00.000 or 00:00.000)
  const parseTimestamp = (timestamp: string): number => {
    const parts = timestamp.split(':');
    if (parts.length === 3) {
      // Format: HH:MM:SS.mmm
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseFloat(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      // Format: MM:SS.mmm
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  // Load subtitles when subtitle changes
  useEffect(() => {
    if (!subtitle) {
      setCues([]);
      return;
    }

    const loadSubtitles = async () => {
      try {
        console.log('📥 Loading subtitle overlay:', subtitle.label);
        const response = await fetch(subtitle.url);
        const content = await response.text();
        console.log('📝 Subtitle content preview:', content.substring(0, 200));
        
        const parsedCues = parseWebVTT(content);
        console.log('🎬 Parsed subtitle cues:', parsedCues.length);
        setCues(parsedCues);
      } catch (error) {
        console.error('❌ Failed to load subtitle overlay:', error);
        setCues([]);
      }
    };

    loadSubtitles();
  }, [subtitle]);

  // Find current cue based on video time
  useEffect(() => {
    const activeCue = cues.find(cue => 
      currentTime >= cue.startTime && currentTime <= cue.endTime
    );
    setCurrentCue(activeCue || null);
  }, [cues, currentTime]);

  if (!isVisible || !currentCue) {
    return null;
  }

  return (
    <div className="subtitle-overlay">
      <div className="subtitle-text">
        {currentCue.text.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export default SubtitleOverlay;
