import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'NoteVaultPro — نظّم أفكارك، وشارك إبداعك'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08080c',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.35) 0%, rgba(8,8,12,0) 60%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 96,
            height: 96,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', color: 'white', fontSize: 52, fontWeight: 900 }}>N</div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          NoteVaultPro
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 20,
            fontSize: 30,
            color: '#94a3b8',
            fontWeight: 500,
          }}
        >
          Organize your notes. Share your ideas.
        </div>
      </div>
    ),
    { ...size }
  )
}
