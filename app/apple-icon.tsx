import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 88,
          background: '#2d3a47',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d7b46a',
          fontWeight: 700,
          fontFamily: 'serif',
          borderRadius: 24,
        }}
      >
        SL
      </div>
    ),
    size,
  )
}
