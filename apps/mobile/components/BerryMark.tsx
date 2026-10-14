import Svg, { Circle, Ellipse, Path } from "react-native-svg";

/** Berry, the village guide. Paths match packages/brand/assets/berry-mark.svg. */
export function BerryMark({ size = 96 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={(size * 240) / 220}
      viewBox="0 0 220 240"
      accessibilityRole="image"
      accessibilityLabel="Berry, the FunBerry superhero"
    >
      <Path d="M40 96 C 2 120 2 196 34 228 C 40 190 66 168 92 160 C 66 150 46 126 40 96 Z" fill="#6d28d9" />
      <Path d="M180 96 C 218 120 218 196 186 228 C 180 190 154 168 128 160 C 154 150 174 126 180 96 Z" fill="#6d28d9" />
      <Path d="M62 84 L 82 54 L 100 78 L 118 52 L 138 84 C 122 96 78 96 62 84 Z" fill="#18b05a" />
      <Path d="M46 92 C 46 66 154 66 154 92 C 154 140 120 206 100 206 C 80 206 46 140 46 92 Z" fill="#ff2d6a" />
      <Path
        d="M56 108 C 70 98 130 98 144 108 C 150 118 148 130 140 136 C 128 132 120 128 100 128 C 80 128 72 132 60 136 C 52 130 50 118 56 108 Z"
        fill="#1e293b"
      />
      <Ellipse cx="82" cy="118" rx="9" ry="10" fill="#ffffff" />
      <Ellipse cx="118" cy="118" rx="9" ry="10" fill="#ffffff" />
      <Circle cx="84" cy="119" r="4.4" fill="#1e293b" />
      <Circle cx="120" cy="119" r="4.4" fill="#1e293b" />
      <Path d="M84 150 Q 100 164 116 150" fill="none" stroke="#7a0d33" strokeWidth={4.5} strokeLinecap="round" />
      <Path
        d="M100 168 l 6.5 13.2 14.6 2.1 -10.5 10.3 2.5 14.5 -13.1 -6.9 -13.1 6.9 2.5 -14.5 -10.5 -10.3 14.6 -2.1 Z"
        fill="#ffbe20"
      />
    </Svg>
  );
}
