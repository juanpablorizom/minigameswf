import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

export type MinimalIconName =
  | 'arrowRight'
  | 'chevronRight'
  | 'games'
  | 'home'
  | 'impostor'
  | 'plus'
  | 'profile'
  | 'settings';

type MinimalIconProps = {
  name: MinimalIconName;
  size?: number;
  color: string;
  strokeWidth?: number;
};

export function MinimalIcon({ name, size = 24, color, strokeWidth = 2 }: MinimalIconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none'
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      {name === 'arrowRight' ? (
        <>
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
          <Path d="M13 6l6 6-6 6" {...common} />
        </>
      ) : null}

      {name === 'chevronRight' ? <Path d="M9 6l6 6-6 6" {...common} /> : null}

      {name === 'games' ? (
        <>
          <Rect x="5" y="5" width="14" height="14" rx="3" transform="rotate(-12 12 12)" {...common} />
          <Circle cx="9" cy="9" r="1" fill={color} />
          <Circle cx="12" cy="12" r="1" fill={color} />
          <Circle cx="15" cy="15" r="1" fill={color} />
        </>
      ) : null}

      {name === 'home' ? (
        <>
          <Path d="M4 11.5L12 4l8 7.5" {...common} />
          <Path d="M6.5 10.5V20h11v-9.5" {...common} />
          <Path d="M10 20v-5h4v5" {...common} />
        </>
      ) : null}

      {name === 'impostor' ? (
        <>
          <Path d="M7 9.5C7 6.7 9.2 4.5 12 4.5s5 2.2 5 5v6.8c0 1.8-1.4 3.2-3.2 3.2H10c-1.7 0-3-1.3-3-3V9.5z" {...common} />
          <Path d="M9.5 10.5c1.4-1.2 3.6-1.2 5 0" {...common} />
          <Circle cx="10" cy="13" r="1" fill={color} />
          <Circle cx="14" cy="13" r="1" fill={color} />
          <Path d="M10 16h4" {...common} />
        </>
      ) : null}

      {name === 'profile' ? (
        <>
          <Circle cx="12" cy="8" r="3.2" {...common} />
          <Path d="M5.5 19c1.2-3 3.4-4.5 6.5-4.5s5.3 1.5 6.5 4.5" {...common} />
        </>
      ) : null}

      {name === 'plus' ? (
        <>
          <Line x1="12" y1="7" x2="12" y2="17" {...common} />
          <Line x1="7" y1="12" x2="17" y2="12" {...common} />
        </>
      ) : null}

      {name === 'settings' ? (
        <>
          <Path
            d="M9.6 3.7h4.8l.6 2.3c.5.2 1 .5 1.4.8l2.3-.7 2.4 4.2-1.7 1.6v1.8l1.7 1.6-2.4 4.2-2.3-.7c-.4.3-.9.6-1.4.8l-.6 2.3H9.6L9 19.6c-.5-.2-1-.5-1.4-.8l-2.3.7-2.4-4.2 1.7-1.6v-1.8L2.9 10.3l2.4-4.2 2.3.7c.4-.3.9-.6 1.4-.8l.6-2.3z"
            {...common}
          />
          <Circle cx="12" cy="12" r="3.1" {...common} />
        </>
      ) : null}
    </Svg>
  );
}
